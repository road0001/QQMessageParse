# QQMessageParse
#### 一个简易的QQ消息解析查看工具。

## 功能
- 自动解析QQ导出的消息记录mht文件，并生成按月拆分的html页面。
- 从mht文件中读取图片数据，并生成图片数据整合包（按1GB分割）。
- 通过NW.JS客户端流式读取图片数据包，显示聊天记录中的图片。
- 支持单聊、群消息，支持消息按月显示、按日期跳转、全局搜索等功能。
- 点击图片显示大图，右击图片另存为。
- 更多功能敬请期待！

## 注意事项

由于新版本QQNT不再支持导出聊天消息记录，本工具无法兼容，因此请勿升级QQNT，使用QQ 7.2.23以下版本导出聊天记录。

## 免责声明
本工具开源免费，禁止用于任何商业及非法用途！对因违规使用本工具造成的任何后果，本工具的开发者将不承担任何责任，并保留一切解释权！

## 基本使用方法

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







































