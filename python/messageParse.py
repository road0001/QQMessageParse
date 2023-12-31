import os
import sys
import json
import time
import base64
from loguru import logger

'''
- 20231231
	- 加入输出图片的计数。
	- 加入处理进度百分比显示。
	- 调整图片索引为txt文件。
	- 优化导出图片数据时的内存占用。
	- 优化HTML写入逻辑，提升HTML输出速度。
	- 修复处理大量数据时报错的bug。
- 20231227
	- 加入输出用时。
	- 加入脚本、样式强制指定编码功能，防止乱码。
- 20231226
	- 去除日期数据写入功能。
	- 加入图片数据生成时的数字滚动。
	- 优化HTML写入性能。
	- 优化图片数据解析性能。
	- 修复在不输出图片时报错的bug。
- 20231225
	- 优化文件写入性能。
- 20231224
	- 初始版本。
	- 实现需求功能。
'''

outputPath=''
sys.set_int_max_str_digits(0)

def cmd(c):
	os.system(c)
def pause(c=None):
	if c:
		print(c)
	cmd('pause>nul')

runningIndex=0
def running():
	global runningIndex
	runningArr=['|','/','-','\\']
	runningStr=runningArr[runningIndex]
	runningIndex+=1
	if runningIndex>=4:
		runningIndex=0
	return runningStr

def formatSeconds(s):
	timeObj=time.gmtime(s)
	timeStr=''
	if s<60:
		# timeStr=f'{round(s,2)}秒'
		timeStr=f'{s:.2f}秒'
	else:
		if timeObj.tm_yday-1>0:
			timeStr+=f'{timeObj.tm_yday-1}天'
		if timeObj.tm_hour>0:
			timeStr+=f'{timeObj.tm_hour}小时'
		if timeObj.tm_min>0:
			timeStr+=f'{timeObj.tm_min}分'
		if timeObj.tm_sec>=0:
			timeStr+=f'{timeObj.tm_sec}秒'
	return timeStr

def parseLine(line):
	line=line.strip()
	if line=='' or line=='\r' or line=='\n' or line=='\r\n':
		return {'type':False,'text':'','origin':line}
	elif line[1:]=='From: <Save by Tencent MsgMgr>' or line[0:]=='Subject: Tencent IM Message' or line[0:]=='MIME-Version: 1.0' or line[0:]=='Content-Type:multipart/related;' or line[0:]=='charset="utf-8"' or line[0:]=='type="text/html";':
		return {'type':'head','text':line.strip(),'origin':line}
	elif line[0:8]=='boundary':
		boundary=line.split('boundary=')[1].replace('"','')
		return {'type':'boundary','text':boundary.strip(),'origin':line}
	elif line[0:2]=='--':
		return {'type':'boundarySplit','text':line[2:].strip(),'origin':line}
	elif line[0:12]=='Content-Type':
		return {'type':'Content-Type','text':line.split(':')[1].strip(),'origin':line}
	elif line[0:25]=='Content-Transfer-Encoding':
		return {'type':'Content-Transfer-Encoding','text':line.split(':')[1].strip(),'origin':line}
	elif line[0:16]=='Content-Location':
		return {'type':'Content-Location','text':line.split(':')[1].strip(),'origin':line}
	elif line[0]=='<' and line[-1]=='>':
		return {'type':'html','text':line.strip()}
	else:
		return {'type':'data','text':line.strip()}

htmlMonth=''
htmlMonthLast=''
htmlScript='<script src="/scripts/jquery-3.0.0.min.js" charset="UTF-8"></script><script src="/scripts/jquery.extensions.dom.js" charset="UTF-8"></script><script src="/scripts/utils.js" charset="UTF-8"></script><script src="/scripts/message.js" charset="UTF-8"></script><link rel="stylesheet" href="/styles/message.css" charset="UTF-8">'
htmlHead='<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="UTF-8"/><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>QQ Message</title><style type="text/css">body{font-size:12px; line-height:22px; margin:2px;}td{font-size:12px; line-height:22px;}</style></head><body><table width="100%" cellspacing="0">'
htmlTail='</table></body></html>'
alreadyWriteScript=False
alreadyWriteCompleted=False
htmlTotalDict={}
# htmlDateList=[]
def writeHtml(html):
	global htmlScript
	# global htmlDateList
	global htmlMonth
	global htmlMonthLast
	global htmlHead
	global htmlTail
	global isFirstFile
	global alreadyWriteScript
	global alreadyWriteCompleted
	global htmlTotalDict

	if html==True and not alreadyWriteCompleted:
		for dateSS in htmlTotalDict:
			with open(f'{outputPath}/{dateSS}.html','a',encoding='utf-8') as f:
				f.write('\n'.join(htmlTotalDict[dateSS]))
				f.flush()
		htmlTotalDict={}
		alreadyWriteCompleted=True
		return

	replaceList=[
		{'origin':'IMG ','target':'IMG loading="lazy" '},
		{'origin':'src=','target':'data-src='},
	]
	htmlStr=html['text']
	for r in replaceList:
		htmlStr=htmlStr.replace(r['origin'],r['target'])
	
	if '日期: ' in htmlStr:
		htmlDate=htmlStr.split('日期: ')[1].split('</td>')[0].split('-')
		htmlMonth=f'{htmlDate[0]}-{htmlDate[1]}'
		htmlDateStr=f'{htmlDate[0]}-{htmlDate[1]}-{htmlDate[2]}'
		htmlStr=htmlStr.replace(htmlDateStr,f'<span id="dateStr_{htmlDateStr}" class="dateTag" date="{htmlDateStr}">{htmlDateStr}</span>')
		# htmlDateList.append(htmlDateStr)
		if htmlMonth != htmlMonthLast:
			htmlMonthLast=htmlMonth
			alreadyWriteScript=False

	if not htmlMonth in htmlTotalDict.keys():
		htmlTotalDict[htmlMonth]=[]
	if not alreadyWriteScript:
		htmlArr=[htmlHead, htmlScript, htmlStr, '']
		htmlTotalDict[htmlMonth].extend(htmlArr)
		alreadyWriteScript=True
	else:
		htmlTotalDict[htmlMonth].append(f'{htmlStr}\n')

	return htmlMonth

	# with open(f'{outputPath}/{htmlMonth}.html','a',encoding='utf-8') as f:
	# 	if not alreadyWriteScript:
	# 		htmlArr=[htmlHead, htmlScript, htmlStr, '']
	# 		f.write('\n'.join(htmlArr))
	# 		# f.write(f'{htmlHead}\n')
	# 		# f.write(f'{htmlScript}\n')
	# 		# f.write(f'{htmlStr}\n')
	# 		# f.write(f'{htmlTail}\n')
	# 		alreadyWriteScript=True
	# 	else:
	# 		f.write(f'{htmlStr}\n')
	# 	f.flush()
	
	# if commit==True:
	# 	if '日期: ' in htmlStr:
	# 		htmlDate=htmlStr.split('日期: ')[1].split('</td>')[0].split('-')
	# 		htmlMonth=f'{htmlDate[0]}-{htmlDate[1]}'
	# 		htmlDateStr=f'{htmlDate[0]}-{htmlDate[1]}-{htmlDate[2]}'
	# 		htmlStr=htmlStr.replace(htmlDateStr,f'<span id="dateStr_{htmlDateStr}" class="dateTag" date="{htmlDateStr}">{htmlDateStr}</span>')
	# 		# htmlDateList.append(htmlDateStr)
	# 		if htmlMonth != htmlMonthLast:
	# 			if htmlMonthLast!='':
	# 				htmlTotalArr.append(htmlTail)
	# 				with open(f'{outputPath}/{htmlMonthLast}.html','a',encoding='utf-8') as f:
	# 					f.write('\n'.join(htmlTotalArr))
	# 					f.flush()
	# 			htmlMonthLast=htmlMonth
	# 			htmlTotalArr=[htmlHead, htmlScript, htmlStr]
	# 		else:
	# 			htmlTotalArr.append(htmlStr)
	# 	else:
	# 		htmlTotalArr.append(htmlStr)
	# else:
	# 	if '日期: ' in htmlStr:
	# 		htmlDate=htmlStr.split('日期: ')[1].split('</td>')[0].split('-')
	# 		htmlMonth=f'{htmlDate[0]}-{htmlDate[1]}'
	# 		htmlDateStr=f'{htmlDate[0]}-{htmlDate[1]}-{htmlDate[2]}'
	# 		htmlStr=htmlStr.replace(htmlDateStr,f'<span id="dateStr_{htmlDateStr}" class="dateTag" date="{htmlDateStr}">{htmlDateStr}</span>')
	# 		# htmlDateList.append(htmlDateStr)
	# 		if htmlMonth != htmlMonthLast:
	# 			htmlMonthLast=htmlMonth
	# 			alreadyWriteScript=False

	# 	with open(f'{outputPath}/{htmlMonth}.html','a',encoding='utf-8') as f:
	# 		if not alreadyWriteScript:
	# 			htmlArr=[htmlHead, htmlScript, htmlStr, '']
	# 			f.write('\n'.join(htmlArr))
	# 			# f.write(f'{htmlHead}\n')
	# 			# f.write(f'{htmlScript}\n')
	# 			# f.write(f'{htmlStr}\n')
	# 			# f.write(f'{htmlTail}\n')
	# 			alreadyWriteScript=True
	# 		else:
	# 			f.write(f'{htmlStr}\n')
	# 		f.flush()

offsetIndex=0
dataFileName=1
offsetData={}
def writeData(data, commit=True):
	global offsetIndex
	global dataFileName
	global offsetData
	
	if data['location']=='' or len(data['data'])<=0:
		return False
	
	fileName=data['location']
	fileType=data['type']
	fileEncoding=data['encoding']
	fileData=''.join(data['data'])
	realData=None

	if fileEncoding=='base64':
		realData=base64.b64decode(fileData)
	
	if commit==True:
		dataPath=f'{outputPath}/{dataFileName}.dat'
		with open(dataPath,'ab') as f:
			f.write(realData)
			# f.flush()
			# f.close()

		offsetData[fileName]={
			'file':f'{dataFileName}.dat',
			'name':fileName,
			'offset':offsetIndex,
			'size':len(realData),
			'type':fileType,
		}
		offsetIndex=os.path.getsize(dataPath)

		if offsetIndex>=1073741824:
		# if offsetIndex>=1048576:
			outputOffset()
			offsetData={}
			dataFileName+=1
			offsetIndex=0

		return True
	else:
		dataPath=f'{outputPath}/{fileName}'
		with open(dataPath,'wb') as f:
			f.write(realData)
			# f.flush()
			# f.close()
		return True

# def outputDateList():
# 	global htmlDateList
# 	a=json.dumps(htmlDateList)
# 	with open(f'{outputPath}/date.json','w',encoding='utf-8') as f:
# 		f.write(a)
# 		f.flush()
# 		f.close()

def outputOffset():
	global offsetData
	with open(f'{outputPath}/imgdata.txt','a',encoding='utf-8') as f:
		for key in offsetData:
			cur=offsetData[key]
			f.write(f'{cur["file"]}|{cur["name"]}|{cur["type"]}|{cur["offset"]}|{cur["size"]}\n')
	
	# global offsetData
	# offsetList=[]
	# for key in offsetData:
	# 	cur=offsetData[key]
	# 	offsetList.append(f'{cur["file"]}|{cur["name"]}|{cur["type"]}|{cur["offset"]}|{cur["size"]}')
	# a=json.dumps(offsetList)
	# with open(f'{outputPath}/imgdata.json','w',encoding='utf-8') as f:
	# 	f.write(a)
	# 	f.flush()
	# 	f.close()

def exist(dirs):
	return os.path.exists(dirs)

def calcLines(file, lenPerLine):
	fileSize=os.path.getsize(file)
	return int(fileSize / lenPerLine)

def main(name):
	global outputPath
	global alreadyWriteCompleted
	folderName=name.replace('.mht','')
	with open(name,'r',encoding='utf-8') as f:
		index=1
		contentData={
			'type':'',
			'encoding':'',
			'location':'',
			'data':[],
		}
		boundary=''
		boundarySplit=''
		status=''
		beginTime=0
		endTime=0
		totalBeginTime=0
		totalEndTime=0
		totalImgNum=0
		totalLines=calcLines(name,100) # base64部分每行100个字节，忽略HTML部分，只计算近似数量

		isOutputData=input('是否输出图片资源？[Y/N] ')
		if isOutputData=='y' or isOutputData=='Y':
			isOutputData=True
		else:
			isOutputData=False

		outputPath=f'{outputDir}/{folderName}'
		totalBeginTime=time.time()
		if not exist(outputPath):
			os.makedirs(outputPath)
		while True:
			try:
				data=f.readline()
				if not data:
					if isOutputData:
						outputOffset()
					# outputDateList()
					totalEndTime=time.time()
					print(f'(100%)END. [{formatSeconds(totalEndTime - totalBeginTime)}]')
					break
				parse=parseLine(data)
				if parse['type']=='html':
					status='html'
					wh=writeHtml(parse)
					percent=(index / totalLines) * 100
					print(f'({percent:.2f}%) {index} Write HTML {wh}')
				elif parse['type']=='Content-Type':
					status='Content-Type'
					contentData['type']=parse['text']
				elif parse['type']=='Content-Transfer-Encoding':
					status='Content-Transfer-Encoding'
					contentData['encoding']=parse['text']
				elif parse['type']=='Content-Location':
					if not alreadyWriteCompleted:
						writeHtml(True)
						percent=(index / totalLines) * 100
						print(f'{percent:.2f}%) {index} Write HTML End.')
					if not isOutputData:
						# outputDateList()
						totalEndTime=time.time()
						print(f'END WITHOUT DATA. [{formatSeconds(totalEndTime - totalBeginTime)}]')
						break
					status='Content-Location'
					contentData['location']=parse['text']
				elif parse['type']=='boundary':
					status='boundary'
					boundary=parse['text']
				elif parse['type']=='boundarySplit':
					status='boundarySplit'
					boundarySplit=parse['text']
					if isOutputData:
						ws=writeData(contentData)
						endTime=time.time()
						if ws==True:
							totalImgNum+=1
							percent=(index / totalLines) * 100
							print(f'\r({percent:.2f}%) {index} Write IMG Data {totalImgNum} [{formatSeconds(endTime - beginTime)}]')

						beginTime=time.time()
						contentData={
							'type':'',
							'encoding':'',
							'location':'',
							'data':[],
						}
				elif parse['type']=='data':
					status='data'
					contentData['data'].append(parse['text'])
					# sys.stdout.write(f'\r{running()} {index}\t\t')
					sys.stdout.write(f'\r{index}')
					sys.stdout.flush()
				elif parse['type']==False:
					status=False
				index+=1
			except Exception as e:
				print('ERROR.',e)
				logger.exception('Exception')
				break
	pause()

outputDir=f'{os.getcwd()}\\output'.replace('\\','/')
if __name__=='__main__':
	messageName=sys.argv[1].split('\\')[-1]
	if messageName[-4:]!='.mht':
		print('不是QQ消息导出文件MHT！')
	else:
		print(messageName)
		print(f'{outputDir}/{messageName}')
		main(messageName)


