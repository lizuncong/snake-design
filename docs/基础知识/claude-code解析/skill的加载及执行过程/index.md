## skill的加载及执行过程

本次demo以打招呼为例，共经过四轮循环

![image](./01.png)

- 第一轮循环：调用接口，生成会话标题。具体参数见[第一轮循环出入参](./第一轮循环接口调用参数/request.json)
- 第二轮循环：发送用户消息，模型返回加载 ”hello-baby“ skill的指令。具体参数详见[第二轮循环出入参](./第二轮循环接口调用参数/request.json)
- 第三轮循环："Skill"工具调用，获取 "hello-baby" 的内容，并传给模型。模型返回调用`Bash`工具执行`get_user_name`脚本的指令。具体参数详见[第三轮循环出入参](./第三轮循环接口调用参数/request.json)
- 第四轮循环： `Bash`工具执行`get_user_name`脚本，返回用户名。模型返回打招呼结果。具体参数详见[第四轮循环出入参](./第四轮循环接口调用参数/request.json)

### Skill 中 Bash 脚本的结果如何获取

如果将console.log(getUserName())改为getUserName()，终端没有执行日志，模型没法获得脚本执行结果。如下图所示

![image](./02.png)

![image](./03.png)

将结果输出到终端中，bash工具即可获取到结果。

![image](./09.png)

### Skill 中 Bash 路径解析规则

1. 正确路径：

![image](./05.png)

2. 错误路径：

![image](./04.png)

3. 正确路径：使用绝对路径

![image](./06.png)

4. 正确路径：使用绝对路径

![image](./07.png)

5. 错误路径：使用绝对路径，但没有skill name

![image](./08.png)

6. 正确路径：使用相对路径

![image](./10.png)