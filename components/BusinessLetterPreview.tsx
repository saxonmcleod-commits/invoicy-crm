import React, { useRef, useState, useLayoutEffect } from 'react';
import { BusinessLetter, CompanyInfo } from '../types';

interface PreviewProps {
  letter: BusinessLetter;
  companyInfo: CompanyInfo;
}

const ScaledPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const PAGE_WIDTH_PX = 800;
  const PAGE_ASPECT_RATIO = 1.414;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        setScale(newWidth < PAGE_WIDTH_PX ? newWidth / PAGE_WIDTH_PX : 1);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        className="mb-8 shadow-lg"
        style={{
          width: `${PAGE_WIDTH_PX * scale}px`,
          height: `${PAGE_WIDTH_PX * PAGE_ASPECT_RATIO * scale}px`,
        }}
      >
        <div
          style={{
            width: `${PAGE_WIDTH_PX}px`,
            height: `${PAGE_WIDTH_PX * PAGE_ASPECT_RATIO}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="bg-white"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const LetterPage: React.FC<{
  letter: BusinessLetter;
  companyInfo: CompanyInfo;
  bodyLines: string[];
  showHeader: boolean;
  showFooter: boolean;
}> = ({ letter, companyInfo, bodyLines, showHeader, showFooter }) => {
  return (
    <div className="bg-white text-black p-8 sm:p-12 lg:p-16 font-serif text-sm leading-relaxed h-full flex flex-col">
      {showHeader && (
        <>
          <div className="flex justify-between items-start mb-12">
            {companyInfo.logo ? (
              <img
                src={companyInfo.logo}
                alt="Company Logo"
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div></div> // Empty div to maintain layout
            )}
            <div className="text-right">
              <p className="font-bold text-base">{companyInfo.name}</p>
              <p className="whitespace-pre-wrap">{companyInfo.address}</p>
            </div>
          </div>
          {/* Fix: Changed issueDate to issue_date */}
          <p className="text-right mb-12">{letter.issue_date}</p>
          <div className="mb-8">
            <p className="font-bold">{letter.customer?.name || ''}</p>
            <p className="whitespace-pre-wrap">{letter.customer?.address || ''}</p>
          </div>
          <div className="mb-8">
            <p className="font-bold">RE: {letter.subject}</p>
          </div>
        </>
      )}

      <div className="whitespace-pre-wrap flex-grow">{bodyLines.join('\n')}</div>

      {showFooter && (
        <div className="mt-auto pt-16">
          <p>Sincerely,</p>
          <p className="mt-8 font-bold">{companyInfo.name}</p>
        </div>
      )}
    </div>
  );
};

const BusinessLetterPreview: React.FC<PreviewProps> = ({ letter, companyInfo }) => {
  if (!letter.customer) {
    return (
      <ScaledPage>
        <div className="bg-white text-slate-800 p-10 font-serif flex items-center justify-center h-full">
          <p className="text-slate-500">Please select a recipient to see a preview.</p>
        </div>
      </ScaledPage>
    );
  }

  const LINES_PER_FIRST_PAGE = 30;
  const LINES_PER_SUBSEQUENT_PAGE = 45;

  const allLines = letter.body.split('\n');

  if (allLines.length <= LINES_PER_FIRST_PAGE) {
    return (
      <ScaledPage>
        <LetterPage
          letter={letter}
          companyInfo={companyInfo}
          bodyLines={allLines}
          showHeader={true}
          showFooter={true}
        />
      </ScaledPage>
    );
  }

  const firstPageLines = allLines.slice(0, LINES_PER_FIRST_PAGE);
  const remainingLines = allLines.slice(LINES_PER_FIRST_PAGE);

  const subsequentPageChunks: string[][] = [];
  for (let i = 0; i < remainingLines.length; i += LINES_PER_SUBSEQUENT_PAGE) {
    subsequentPageChunks.push(remainingLines.slice(i, i + LINES_PER_SUBSEQUENT_PAGE));
  }
  const allChunks = [firstPageLines, ...subsequentPageChunks];

  return (
    <>
      {allChunks.map((chunk, index) => (
        <ScaledPage key={index}>
          <LetterPage
            letter={letter}
            companyInfo={companyInfo}
            bodyLines={chunk}
            showHeader={index === 0}
            showFooter={index === allChunks.length - 1}
          />
        </ScaledPage>
      ))}
    </>
  );
};

export default BusinessLetterPreview;
