import { App, Stack } from "aws-cdk-lib";
import { GatewayVpcEndpointAwsService, Vpc } from "aws-cdk-lib/aws-ec2";
import { Cluster } from "aws-cdk-lib/aws-ecs";

type InfraStackProps = {};

export default class InfraStack extends Stack {
  public cluster: Cluster;
  public vpc: Vpc;

  constructor(scope: App, id: string, props: InfraStackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "infra-vpc");
    this.vpc.addGatewayEndpoint("DynamoDBGatewayEndpoint", {
      service: GatewayVpcEndpointAwsService.DYNAMODB,
    });

    this.cluster = new Cluster(this, "server-cluster", {
      vpc: this.vpc,
    });
  }
}
