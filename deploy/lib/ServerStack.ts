import { App, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  FargateTaskDefinition,
  FargateService,
  Cluster,
  ContainerImage,
  PropagatedTagSource,
} from "aws-cdk-lib/aws-ecs";
import { SubnetType } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { join } from "path";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface ServerStackProps extends StackProps {
  cluster: Cluster;
  todoTaskTable: Table;
  todoListTable: Table;
}

export default class ServerStack extends Stack {
  constructor(scope: App, id: string, props: ServerStackProps) {
    super(scope, id, props);

    const taskDefinition = new FargateTaskDefinition(this, "service-task");

    props.todoTaskTable.grantReadWriteData(taskDefinition.taskRole);
    props.todoListTable.grantReadWriteData(taskDefinition.taskRole);
    const dockerImageAsset = new DockerImageAsset(this, "inline-image", {
      directory: join(__dirname, "..", ".."),
    });

    const servicePort = 3000;

    const containerDef = taskDefinition.addContainer("server-container", {
      image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
      environment: {
        TODO_TASK_TABLE_NAME: props.todoTaskTable.tableName,
        TODO_LIST_TABLE_NAME: props.todoListTable.tableName,
      },
    });
    containerDef.addPortMappings({ containerPort: servicePort });

    new FargateService(this, "server-service", {
      taskDefinition,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      cluster: props.cluster,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      desiredCount: 1,
      healthCheckGracePeriod: Duration.seconds(10),
      propagateTags: PropagatedTagSource.TASK_DEFINITION,
    });
  }
}
