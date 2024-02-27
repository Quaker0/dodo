import { App, Stack, RemovalPolicy } from "aws-cdk-lib";
import { Cluster } from "aws-cdk-lib/aws-ecs";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Vpc, GatewayVpcEndpointAwsService } from "aws-cdk-lib/aws-ec2";

type InfraStackProps = {};

export default class InfraStack extends Stack {
  public cluster: Cluster;
  public vpc: Vpc;
  public todoListTable: Table;
  public todoTaskTable: Table;

  constructor(scope: App, id: string, props: InfraStackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "infra-vpc");
    this.vpc.addGatewayEndpoint("DynamoDBGatewayEndpoint", {
      service: GatewayVpcEndpointAwsService.DYNAMODB,
    });

    this.cluster = new Cluster(this, "server-cluster", {
      vpc: this.vpc,
    });

    this.todoListTable = new Table(this, "TodoListTable", {
      tableName: "todo-list-table",
      partitionKey: {
        name: "listId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.todoTaskTable = new Table(this, "TodoTaskTable", {
      tableName: "todo-task-table",
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
