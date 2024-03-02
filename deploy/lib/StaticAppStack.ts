import { App, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { PriceClass } from "aws-cdk-lib/aws-cloudfront";
import { Bucket, BucketAccessControl, HttpMethods } from "aws-cdk-lib/aws-s3";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";

export default class StaticAppStack extends Stack {
  public readonly appBucket: Bucket;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.appBucket = new Bucket(this, "dodo-app-bucket", {
      bucketName: "dodo-app",
      publicReadAccess: true,
      accessControl: BucketAccessControl.PUBLIC_READ,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
          allowedOrigins: ["niclas.tech"],
        },
      ],
    });

    const certificate = Certificate.fromCertificateArn(
      this,
      "niclas-tech-certificate",
      ""
    );

    new CloudFrontToS3(this, "staticCloudfrontS3", {
      existingBucketObj: this.appBucket,
      insertHttpSecurityHeaders: true,
      cloudFrontDistributionProps: {
        domainNames: ["niclas.tech"],
        priceClass: PriceClass.PRICE_CLASS_100,
        certificate,
      },
    });
  }
}
