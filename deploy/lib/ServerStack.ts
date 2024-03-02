import { App, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Port, SecurityGroup, SubnetType } from "aws-cdk-lib/aws-ec2";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import {
  Cluster,
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
  PropagatedTagSource,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ListenerAction,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { join } from "path";

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
      directory: join(__dirname, "..", "..", "services"),
    });

    const servicePort = 3000;

    const containerDef = taskDefinition.addContainer("server-container", {
      image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
      environment: {
        TODO_TASK_TABLE_NAME: props.todoTaskTable.tableName,
        TODO_LIST_TABLE_NAME: props.todoListTable.tableName,
      },
      logging: LogDrivers.awsLogs({
        streamPrefix: "dodo-server",
        logRetention: 30,
      }),
    });
    containerDef.addPortMappings({ containerPort: servicePort });

    const securityGroup = new SecurityGroup(this, "dodo-security-group", {
      vpc: props.cluster.vpc,
    });

    const service = new FargateService(this, "server-service", {
      taskDefinition,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      cluster: props.cluster,
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      desiredCount: 1,
      securityGroups: [securityGroup],
      propagateTags: PropagatedTagSource.TASK_DEFINITION,
    });

    const lb = new ApplicationLoadBalancer(this, "dodo-load-balancer", {
      loadBalancerName: "dodo-server",
      vpc: props.cluster.vpc,
      internetFacing: true,
    });
    const certificate = Certificate.fromCertificateArn(
      this,
      "dodo-cert",
      "arn:aws:acm:us-east-1:491268129897:certificate/702aa21c-623d-496e-90cb-c6820cb88c3a"
    );
    const listener = lb.addListener("SSL-listener", {
      protocol: ApplicationProtocol.HTTPS,
      certificates: [certificate],
    });
    const httpListener = lb.addListener("http-listener", {
      protocol: ApplicationProtocol.HTTP,
      port: 80,
    });

    listener.addTargets("dodo-service-target", {
      targets: [service],
      deregistrationDelay: Duration.minutes(0),
      protocol: ApplicationProtocol.HTTP,
      healthCheck: {
        path: "/health",
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
      },
    });
    lb.connections.securityGroups.map((s) =>
      securityGroup.addIngressRule(s, Port.tcp(servicePort))
    );

    httpListener.addTargets("dodo-service-target", {
      targets: [service],
      deregistrationDelay: Duration.minutes(0),
      protocol: ApplicationProtocol.HTTP,
      healthCheck: {
        path: "/health",
        healthyThresholdCount: 2,
        interval: Duration.seconds(10),
      },
    });
  }
}
