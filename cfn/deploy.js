const { exec } = require("child_process");
const { readFileSync } = require("fs");

class DeployUtils {
  /**
   * @param { [key: string]: any } params The parameters object
   * @returns {string}
   */
  formatParametersString(params) {
    return Object.keys(params).map(key => `${key}=${JSON.stringify(params[key])}`).join(' ');
  }

  /**
   * @param {string} command
   * @returns {Promise<void>}
   */
  runCommand(command) {
    if (Array.isArray(command)) {
      command = command.join(' ');
    }
    console.log(`** Running command: ${command}`);
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
          if (error) {
              return reject(error);
          }
          if (stderr) {
              return reject(stderr);
          }
          return resolve(stdout);
      });
    });
  }

  /**
   * Parsed process.argv into an object
   * @returns {Map<string, any>}
   */
  getParsedArgs() {
    const parsedArgs = new Map();
    process.argv
      .filter(a => a.includes('='))
      .forEach(a => {
        const [key, value] = a.split('=');
        const fixedKey = key.split('--').pop();
        try {
          parsedArgs.set(fixedKey, JSON.parse(value));
        } catch {
          parsedArgs.set(fixedKey, value);
        }
      });
    return parsedArgs;
  }
}

class ApiDeployer {
  utils = new DeployUtils();

  /**
   * @param { { stackName: string, awsProfile: string, stagingBucket: string, parameters: { [key: string]: any }, build: boolean, zip: boolean } } options 
   */
  constructor(options) {
    this.options = options;
  }

  async deploy() {
    if (this.options.install) {
      await this.install();
    }
    if (this.options.build) {
      await this.build();
    }
    if (this.options.zip) {
      await this.zip();
    }
    await this.package();
    await this.cfn();
  }

  /**
   * @private 
   */
  async install() {
    try {
      console.log(await this.utils.runCommand('rimraf .\\node_modules\\'));
      console.log(await this.utils.runCommand('npm install'));
    } catch (ex) {
      if (ex.toString().includes('ERROR')) {
        throw ex;
      }
    }
  }

  /**
   * @private 
   */
  async build() {
    try {
      console.log(await this.utils.runCommand('npm run build'));
      console.log(await this.utils.runCommand('npm prune --production'));
    } catch (ex) {
      if (ex.toString().includes('ERROR')) {
        throw ex;
      }
    }
  }

  async zip() {
    console.log(await this.utils.runCommand(`rimraf ./cfn/artifacts.zip`));
    console.log(await this.utils.runCommand(`7z a ./cfn/artifacts.zip ./dist/*`));
    console.log(await this.utils.runCommand(`7z a ./cfn/artifacts.zip ./node_modules/ -r`));
  }

  async package() {
    console.log(await this.utils.runCommand([
      `aws cloudformation package`,
      `--template-file ./cfn/cloudformation.yaml`,
      `--s3-bucket ${this.options.stagingBucket}`,
      `--output-template-file ./cfn/cloudformation-packaged.yaml`,
      `--profile ${this.options.awsProfile}`,
    ]));
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async cfn() {
    try {
      console.log(await this.utils.runCommand([
        `aws cloudformation deploy`,
        `--template-file ./cfn/cloudformation-packaged.yaml`,
        `--stack-name ${this.options.stackName}`,
        `--parameter-overrides ${this.utils.formatParametersString(this.options.parameters)}`,
        `--profile ${this.options.awsProfile}`,
        `--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND`,
      ]));
    } catch (ex) {
      if (!ex.message.includes('No changes')) {
        throw ex;
      }
    }
  }
}

const parsedArgs = new DeployUtils().getParsedArgs();

const environmentDetails = require('./environments.json')[parsedArgs.get('env')];

new ApiDeployer({
  ...environmentDetails,
  // build: !(parsedArgs.has('build') && parsedArgs.get('build') === false),
  // install: !(parsedArgs.has('install') && parsedArgs.get('install') === false),
  // zip: !(parsedArgs.has('zip') && parsedArgs.get('zip') === false),
})
  .deploy()
  .then(() => console.log('Done!'))
  .catch(err => console.error(err));