import os
import sys
import json
import base64

'''
- 20231225
	- 优化文件写入性能。
- 20231224
	- 初始版本。
	- 实现需求功能。
'''

outputPath=''

def cmd(c):
	os.system(c)
def pause(c=None):
	if c:
		print(c)
	cmd('pause>nul')

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

htmlMonth='default'
htmlMonthLast=''
htmlScript='<script src="/scripts/jquery-3.0.0.min.js"></script><script src="/scripts/utils.js"></script><script src="/scripts/message.js"></script><link rel="stylesheet" href="/styles/message.css">'
htmlHead='<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>QQ Message</title><style type="text/css">body{font-size:12px; line-height:22px; margin:2px;}td{font-size:12px; line-height:22px;}</style></head><body><table width="100%" cellspacing="0">'
htmlTail='</table></body></html>'
alreadyWriteScript=False
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

	with open(f'{outputPath}/{htmlMonth}.html','a',encoding='utf-8') as f:
		if not alreadyWriteScript:
			f.write(f'{htmlHead}\n')
			f.write(f'{htmlScript}\n')
			f.write(f'{htmlStr}\n')
			# f.write(f'{htmlTail}\n')
			alreadyWriteScript=True
		else:
			f.write(f'{htmlStr}\n')
		f.flush()
		f.close()

offsetIndex=0
dataFileName=1
offsetData={}
def writeData(data, commit=True):
	global offsetIndex
	global dataFileName
	global offsetData
	if data['location']=='' or data['data']=='':
		return False
	fileName=data['location']
	fileType=data['type']
	fileEncoding=data['encoding']
	fileData=data['data']
	realData=None

	if fileEncoding=='base64':
		realData=base64.b64decode(fileData)
	
	if commit==True:
		dataPath=f'{outputPath}/{dataFileName}.dat'
		with open(dataPath,'ab') as f:
			f.write(realData)
			f.flush()
			f.close()

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
			dataFileName+=1
			offsetIndex=0
	else:
		dataPath=f'{outputPath}/{fileName}'
		with open(dataPath,'wb') as f:
			f.write(realData)
			f.flush()
			f.close()

# def outputDateList():
# 	global htmlDateList
# 	a=json.dumps(htmlDateList)
# 	with open(f'{outputPath}/date.json','w',encoding='utf-8') as f:
# 		f.write(a)
# 		f.flush()
# 		f.close()

def outputOffset():
	global offsetData
	offsetList=[]
	for key in offsetData:
		cur=offsetData[key]
		offsetList.append(f'{cur["file"]}&{cur["name"]}&{cur["type"]}&{cur["offset"]}&{cur["size"]}')
	a=json.dumps(offsetList)
	with open(f'{outputPath}/imgdata.json','w',encoding='utf-8') as f:
		f.write(a)
		f.flush()
		f.close()

def exist(dirs):
	return os.path.exists(dirs)

def main(name):
	global outputPath
	folderName=name.replace('.mht','')
	with open(name,'r',encoding='utf-8') as f:
		index=1
		contentData={
			'type':'',
			'encoding':'',
			'location':'',
			'data':'',
		}
		boundary=''
		boundarySplit=''
		status=''

		isOutputData=input('是否输出图片资源？[Y/N]')
		if isOutputData=='y' or isOutputData=='Y':
			isOutputData=True
		else:
			isOutputData=False

		outputPath=f'{outputDir}/{folderName}'
		if not exist(outputPath):
			os.makedirs(outputPath)
		while True:
			try:
				data=f.readline()
				if not data:
					if isOutputData:
						outputOffset()
					# outputDateList()
					print('END.')
					break
				parse=parseLine(data)
				if parse['type']=='html':
					status='html'
					writeHtml(parse)
					print(index,'Write HTML')
				elif parse['type']=='Content-Type':
					status='Content-Type'
					contentData['type']=parse['text']
				elif parse['type']=='Content-Transfer-Encoding':
					status='Content-Transfer-Encoding'
					contentData['encoding']=parse['text']
				elif parse['type']=='Content-Location':
					if not isOutputData:
						outputDateList()
						print('END WITHOUT DATA.')
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
						writeData(contentData)
						contentData={
							'type':'',
							'encoding':'',
							'location':'',
							'data':'',
						}
						print(index,'Write IMG Data')
				elif parse['type']=='data':
					status='data'
					contentData['data']+=parse['text']
				elif parse['type']==False:
					status=False
				index+=1
			except Exception as e:
				print('ERROR.',e)
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


