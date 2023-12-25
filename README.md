# QQMessageParse
#### 一个简易的QQ消息解析查看工具。

## 基本使用方法：

- 从release中下载最新版本。
- 从QQ中导出消息
  - 操作方法：菜单-消息管理，选择联系人或群聊，右键-导出消息记录。
  - 保存类型选择mht。
  - 等待导出完成。如果消息很多且有大量图片，则需要很长时间。
- 将导出的mht文件拖放到messageParse.exe上，如果需要导出图片，则按Y确认。
- 等待解析完成。
- 将output目录下的文件夹放入messages中。
- 双击QQMessage.exe，选择相应消息进行查看。

## 构建方法

- Python部分：
  - 安装Python，版本不小于3.11。
  - 双击python/install.bat安装依赖。
  - 双击python/build.bat进行打包。
- NW.JS部分
  - 从https://nwjs.io/ 下载NW.JS最新版本并解压。
  - 将js目录下所有文件放入NW.JS根目录。







































