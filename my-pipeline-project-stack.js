import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import { Repository } from 'aws-cdk-lib/aws-codecommit';

export class MyPipelineProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
      // If you want to create new repository      
      // const repo = new codecommit.Repository(this, 'Repo', {
      //   repositoryName: 'my-repo-name1'
      // });


    const repositoryName = this.node.tryGetContext('repositoryName') as string;
    const myRepository = codecommit.Repository.fromRepositoryName(this, 'MyRepo', repositoryName);
    
    const manualStep = this.node.tryGetContext('manual') as string;

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit_Source',
      repository: myRepository,
      branch: 'main',
      output: sourceOutput,
    });
    

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild_Build',
      project: new codebuild.Project(this, 'MyProject', {
        projectName: 'MyCodeBuildProject5',
        source: codebuild.Source.codeCommit({
          repository: myRepository,
          branchOrRef: 'main',
        }),
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
          environmentVariables: {
            EXAMPLE_VAR: { value: 'example-value' },
          },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: {
              commands: [
                'npm install',
                // 'npm run build',
              ],
            },
          },
        }),
        role: new iam.Role(this, 'MyProjectRole', {
          assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
        }),
      }),
      input: sourceOutput,
      outputs: [buildOutput],
    });

  const pipeline = new codepipeline.Pipeline(this, 'MyPipeline', {
    pipelineName: 'MyCodePipeline',
  });

  pipeline.addStage({
    stageName: 'Source',
    actions: [sourceAction],
  });

  if (manualStep == 'yes') {
    
    const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'Manual_Approval',
      notifyEmails: ['gogsc21@gmail.com'], // Optional: Add email addresses to receive approval notifications
      additionalInformation: 'Please review and approve the changes.', // Optional: Add additional information for the approval
    });
    
    pipeline.addStage({
    stageName: 'ManualApproval',
    actions: [manualApprovalAction],
    });
  }
  
  pipeline.addStage({
    stageName: 'Build',
    actions: [buildAction],
  });


  }
}
