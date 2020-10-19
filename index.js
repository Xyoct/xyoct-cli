#!/usr/bin/env node
// 文件系统
const fs = require('fs');
// 用户输入命令
const program = require('commander');
// 用户交互信息
const inquirer = require('inquirer');
// 从仓库拉取模板
const download = require('download-git-repo');
// handlebars修改文件
const hbs = require('handlebars');
// download 动画效果
const ora = require('ora');
// 提示图标
const symbols = require('log-symbols');
// 字体颜色
const chalk = require('chalk');


/**
 * Usage
 */
program
    .usage('init [koa-template]')
    .version('1.0.0', '-v, --version')
    .command('init <name>')
    .action(name => {
        if (fs.existsSync(name)) {
            console.log(symbols.error, chalk.red('该项目已存在！'));
            return;
        }
        main(name);
    });

/**
 * Help.
 */
program
    .on('--help', () => {
        console.log()
        console.log('  Examples:')
        console.log()
        console.log(chalk.green('    # create a new project with an Github template: xyoct7-cli init <project-name>'))
        console.log('    $ xyoct7-cli init my-project')
        console.log()
    })

/**
 * main
 */
function main(name) {
    inquirer.prompt([
        {
            name: 'description',
            message: '请输入项目描述！',
            default: 'description'
        },
        {
            name: 'author',
            message: '请输入项目作者',
            default: '王二狗'
        },
        {
            type: 'list',
            message: '请选择项目中的数据库类型:',
            name: 'dbtype',
            choices: [
                "MongoDB",
                "Mysql"
            ]
        }
    ]).then((answers) => {
        const spinner = ora('Downloading……');
        let downloadUrl = 'Xyoct/cli-temp'
        if (answers.dbtype == 'MongoDB') {
            downloadUrl += '#db'
        }
        if (answers.dbtype == 'Mysql') {
            downloadUrl += '#mysql'
        }
        spinner.start();
        download(downloadUrl, name, function (err) {
            if (err) {
                spinner.fail();
                console.log(symbols.error, chalk.red(err));
                return;
            }
            spinner.succeed();
            const fileName = `${name}/package.json`;
            const meta = {
                name,
                description: answers.description,
                author: answers.author
            }
            if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString();
                const result = hbs.compile(content)(meta);
                fs.writeFileSync(fileName, result);
            }
            console.log(symbols.success, chalk.green('The project has downloaded successfully!'));
        })
    })
}

program.parse(process.argv);
