import { useCallback,  useEffect, useState } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import './index.css';

import type { PDFDocumentProxy } from 'pdfjs-dist';
import { DownOutlined, FilePdfOutlined, UpOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts',
};

const resizeObserverOptions = {};

const maxWidth = 600;

type PDFFile = string | File | null;

// @ts-ignore
function highlightPattern(text, pattern) {
  //以空格分隔pattern
  const patternArr = pattern.split(' ');

  //遍历替换
  for (let i = 0; i < patternArr.length; i++) {
    //让mark标签序号从2-6随机出现
    const randomNum = Math.floor(Math.random() * 5) + 2;
    text = text.replace(patternArr[i], (value) => `<mark${randomNum}>${value}</mark${randomNum}>`)
  }
  // return text.replace(pattern, (value) => `<mark2>${value}</mark2>`);
  return text;
}

const PDFView = (props: { file:string, searchText:string, pageNum:number } )=> {
  const [file, setFile] = useState<PDFFile>(null);
  const [pageNum, setPageNum] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [searchText, setSearchText] = useState(null);

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);
  useResizeObserver(containerRef, resizeObserverOptions, onResize);

    const textRenderer = useCallback(
    (textItem) => highlightPattern(textItem.str, searchText),
    [searchText]
  );

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
    setPageNum(pageNum);
  }

  //当props参数变化时设置相关数据
  useEffect(() => {
    setFile(props.file);
    if (props.searchText!==null && props.searchText!==''){
      setSearchText(props.searchText);
    }
    setPageNum(props.pageNum);
  }, [props]);
  // @ts-ignore
  return (
    <div className="Example__container__document" ref={setContainerRef}>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
        <Page
          key={pageNum}
          pageNumber={pageNum}
          width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
          customTextRenderer={textRenderer}
          style={{justify:'center'}}
        >
        </Page>
      </Document>
      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24, position: 'fixed', right: '4%', transform: 'translateX(50%)', bottom: '45%' }}>
        <FloatButton icon={<UpOutlined />} onClick={()=> {
          setPageNum(pageNum-1);
        }}/>
        <FloatButton icon={<FilePdfOutlined />} onClick={()=> {
          //打开页面 todo
          window.open(file , '_blank');
        }}/>
        <FloatButton icon={<DownOutlined />} onClick={()=> {
          setPageNum(pageNum+1);
        }}/>
      </FloatButton.Group>
    </div>
  );
}

export default PDFView;