import { Construct } from "constructs";
import { LambdaNode } from "@aws/deployer/lib/constructs/lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Stack } from "aws-cdk-lib";

export class FreetarProxy extends Stack {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const lambda = new LambdaNode(this, "FreetarProxyLambda", {
			entry: `${__dirname}/lambda/proxy.ts`,
			description: "Proxy requests to Ultimate Guitar",
			timeout: 30,
			memorySize: 256,
		}).function;

		const api = new apigateway.LambdaRestApi(this, "FreetarProxyApi", {
			handler: lambda,
			proxy: false,
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: ['GET', 'OPTIONS'],
			},
		});

		const search = api.root.addResource("search");
		search.addMethod("GET");

		const tab = api.root.addResource("tab");
		tab.addResource("{proxy+}").addMethod("GET", new apigateway.LambdaIntegration(lambda));
	}
}
