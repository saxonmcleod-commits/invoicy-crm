import React, { useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Document, CompanyInfo, DocumentItem, DocumentType, Profile, DocumentStatus } from '../types';

interface PreviewProps {
  document: Document;
  companyInfo: CompanyInfo;
  profile: Profile | null;
}

interface ExtendedPreviewProps extends PreviewProps {
  items: DocumentItem[];
  showHeader: boolean;
  showFooter: boolean;
}

const TemplateModern: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-slate-800 p-4 sm:p-6 lg:p-10 font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="flex justify-between items-start pb-8 border-b-2 border-primary-500">
            <div>
              <h1 className="text-4xl font-bold text-primary-600 uppercase tracking-wider">
                {document.type}
              </h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-slate-500 mt-1">{document.doc_number || '...'}</p>
            </div>
            <div className="text-right">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-16 w-auto ml-auto mb-4 object-contain"
                />
              )}
              <h2 className="text-2xl font-semibold text-slate-800">{companyInfo.name}</h2>
              <p className="text-slate-500 whitespace-pre-wrap">{companyInfo.address}</p>
              {companyInfo.abn && <p className="text-slate-500">ABN: {companyInfo.abn}</p>}
            </div>
          </header>

          <section className="grid grid-cols-2 gap-8 my-8">
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-2">
                Bill To
              </h3>
              <p className="font-bold text-lg text-primary-700">{document.customer?.name}</p>
              <p className="text-slate-600">{document.customer?.address}</p>
              <p className="text-slate-600">{document.customer?.email}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <strong className="text-slate-500">Issue Date:</strong> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <strong className="text-slate-500">{document.type === DocumentType.Quote ? 'Valid To:' : 'Due Date:'}</strong> {document.due_date}
              </p>
            </div>
          </section>
        </>
      )}

      <section className="flex-grow">
        <table className="w-full text-left">
          <thead className="bg-primary-500 text-white">
            <tr>
              <th className="p-3 font-semibold uppercase">Description</th>
              <th className="p-3 font-semibold uppercase text-center w-24">Qty</th>
              <th className="p-3 font-semibold uppercase text-right w-32">Unit Price</th>
              <th className="p-3 font-semibold uppercase text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-3 whitespace-pre-wrap">{item.description}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                <td className="p-3 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 space-y-2 text-slate-600">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-xl text-primary-600 border-t-2 border-primary-500 pt-2">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>

          {document.notes && (
            <div className="mt-10 pt-5 border-t border-slate-200">
              <h3 className="font-semibold text-slate-600">Notes</h3>
              <p className="text-sm text-slate-500">{document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateClassic: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 lg:p-10 font-serif h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="text-center mb-10">
            {companyInfo.logo && (
              <img
                src={companyInfo.logo}
                alt="Company Logo"
                className="h-20 w-auto mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-5xl font-bold mb-2 text-gray-900">{companyInfo.name}</h1>
            <p className="text-gray-600 whitespace-pre-wrap">{companyInfo.address}</p>
            {companyInfo.abn && <p className="text-gray-600">ABN: {companyInfo.abn}</p>}
          </header>
          <div className="w-full h-px bg-gray-300 my-8"></div>
          <section className="flex justify-between mb-8 flex-col sm:flex-row gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">{document.type}</h2>
              {/* Fix: Changed docNumber to doc_number */}
              <p>
                <span className="font-semibold text-gray-700">Number:</span> {document.doc_number}
              </p>
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <span className="font-semibold text-gray-700">Issue Date:</span> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <span className="font-semibold text-gray-700">{document.type === DocumentType.Quote ? 'Valid To:' : 'Due Date:'}</span> {document.due_date}
              </p>
            </div>
            <div className="sm:text-right">
              <h3 className="font-semibold mb-1 text-gray-700">Billed To:</h3>
              <p className="text-gray-800">{document.customer?.name}</p>
              <p className="text-gray-600">{document.customer?.address}</p>
              <p className="text-gray-600">{document.customer?.email}</p>
            </div>
          </section>
        </>
      )}

      <section className="flex-grow">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2 text-left">Item Description</th>
              <th className="border border-gray-300 p-2 text-right">Quantity</th>
              <th className="border border-gray-300 p-2 text-right">Price</th>
              <th className="border border-gray-300 p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-2 whitespace-pre-wrap">{item.description}</td>
                <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-right">${item.price.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-right">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-4">
            <table className="w-full sm:w-1/2 md:w-1/3 text-gray-800">
              <tbody>
                <tr>
                  <td className="p-1 text-right">Subtotal:</td>
                  <td className="p-1 text-right">${document.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1 text-right">Tax ({document.tax}%):</td>
                  <td className="p-1 text-right">
                    ${((document.subtotal * document.tax) / 100).toFixed(2)}
                  </td>
                </tr>
                <tr className="font-bold text-lg">
                  <td className="p-1 text-right border-t-2 border-gray-800">Total:</td>
                  <td className="p-1 text-right border-t-2 border-gray-800">
                    ${document.total.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          {document.notes && (
            <div className="mt-10 text-sm text-gray-600">
              <p>{document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateCreative: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-slate-900 text-white p-4 sm:p-6 lg:p-10 font-mono overflow-hidden h-full flex flex-col relative">
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-fuchsia-500/30 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/30 rounded-full filter blur-3xl"></div>
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-400/30 border-8 border-green-400/30 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}

      {showHeader && (
        <>
          <header className="flex justify-between items-center mb-12 relative z-10">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-12 w-auto mb-2 object-contain"
                />
              )}
              <h2 className="text-3xl font-bold tracking-widest text-white">{companyInfo.name}</h2>
              <p className="text-slate-400">{companyInfo.email}</p>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-extrabold text-cyan-400 uppercase">{document.type}</h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-fuchsia-400">{document.doc_number || '...'}</p>
            </div>
          </header>

          <section className="flex justify-between mb-12 relative z-10 flex-col sm:flex-row gap-4">
            <div>
              <p className="text-cyan-400 uppercase text-sm">To:</p>
              <p className="text-lg font-bold text-white">{document.customer?.name}</p>
              <p className="text-slate-400">{document.customer?.address}</p>
            </div>
            <div className="sm:text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p className="text-cyan-400">
                Issue Date: <span className="text-white">{document.issue_date}</span>
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p className="text-cyan-400">
                {document.type === DocumentType.Quote ? 'Valid To:' : 'Due Date:'} <span className="text-white">{document.due_date}</span>
              </p>
            </div>
          </section>
        </>
      )}

      <section className="relative z-10 flex-grow">
        <div className="border-y-2 border-cyan-400">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 border-b border-slate-700 last:border-b-0 flex-col sm:flex-row text-center sm:text-left"
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <p className="font-bold text-lg text-white whitespace-pre-wrap">{item.description}</p>
                <p className="text-fuchsia-400 text-sm">
                  {item.quantity} x ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="text-xl font-bold text-white">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {showFooter && (
        <footer className="mt-auto relative z-10">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-cyan-400 text-slate-900 hover:bg-cyan-300 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-3/5 md:w-2/5 space-y-2 text-lg">
              <div className="flex justify-between">
                <p className="text-slate-400">Subtotal</p>
                <p className="text-white">${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-slate-400">Tax ({document.tax}%)</p>
                <p className="text-white">
                  ${((document.subtotal * document.tax) / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between font-bold text-3xl text-cyan-400 mt-2 pt-2 border-t-2 border-fuchsia-500">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
          {document.notes && (
            <div className="mt-12 text-center text-slate-400">
              <p>// {document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateMinimalist: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 lg:p-10 font-light font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="flex justify-between items-start mb-16">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-10 w-auto mb-2 object-contain"
                />
              )}
              <h2 className="text-xl font-normal tracking-widest uppercase text-gray-800">
                {companyInfo.name}
              </h2>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-normal text-gray-400 uppercase tracking-wider">
                {document.type}
              </h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-gray-500 mt-1">{document.doc_number || '...'}</p>
            </div>
          </header>

          <section className="grid grid-cols-3 gap-8 mb-16">
            <div className="col-span-1">
              <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-2">Billed To</h3>
              <p className="font-medium text-base text-gray-800">{document.customer?.name}</p>
              <p className="text-gray-600 text-sm">{document.customer?.address}</p>
            </div>
            <div className="col-span-1">
              <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-2">Issue Date</h3>
              {/* Fix: Changed issueDate to issue_date */}
              <p className="font-medium text-gray-800">{document.issue_date}</p>
            </div>
            <div className="col-span-1">
              <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-2">{document.type === DocumentType.Quote ? 'Valid To' : 'Due Date'}</h3>
              {/* Fix: Changed dueDate to due_date */}
              <p className="font-medium text-gray-800">{document.due_date}</p>
            </div>
          </section>
        </>
      )}

      <section className="flex-grow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="p-2 pb-3 font-normal text-xs uppercase text-gray-500 tracking-wider">
                Description
              </th>
              <th className="p-2 pb-3 font-normal text-xs uppercase text-gray-500 tracking-wider text-center w-24">
                Qty
              </th>
              <th className="p-2 pb-3 font-normal text-xs uppercase text-gray-500 tracking-wider text-right w-32">
                Unit Price
              </th>
              <th className="p-2 pb-3 font-normal text-xs uppercase text-gray-500 tracking-wider text-right w-32">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 py-3 text-gray-800 whitespace-pre-wrap">{item.description}</td>
                <td className="p-2 py-3 text-center text-gray-800">{item.quantity}</td>
                <td className="p-2 py-3 text-right text-gray-800">${item.price.toFixed(2)}</td>
                <td className="p-2 py-3 text-right text-gray-800">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-2/5 space-y-2 text-gray-600">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-medium text-xl text-black border-t-2 border-black mt-2 pt-2">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
          {document.notes && (
            <div className="mt-10 pt-5 border-t border-gray-200">
              <p className="text-sm text-gray-500">{document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateBold: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-900 font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="bg-gray-900 text-white p-4 sm:p-6 lg:p-10">
            <div className="flex justify-between items-center">
              <div>
                {companyInfo.logo && (
                  <img
                    src={companyInfo.logo}
                    alt="Company Logo"
                    className="h-16 w-auto mb-2 object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                )}
                <h2 className="text-3xl font-bold text-white">{companyInfo.name}</h2>
              </div>
              <div className="text-right">
                <h1 className="text-5xl font-extrabold uppercase text-white">{document.type}</h1>
                {/* Fix: Changed docNumber to doc_number */}
                <p className="text-gray-300 mt-1">{document.doc_number || '...'}</p>
              </div>
            </div>
          </header>
          <section className="grid grid-cols-2 gap-8 my-8 px-4 sm:px-6 lg:px-10">
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-2">
                Bill To:
              </h3>
              <p className="font-bold text-lg text-gray-900">{document.customer?.name}</p>
              <p className="text-gray-600">{document.customer?.address}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <strong className="text-gray-500">Issue Date:</strong>{' '}
                <span className="text-gray-800">{document.issue_date}</span>
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <strong className="text-gray-500">{document.type === DocumentType.Quote ? 'Valid To:' : 'Due Date:'}</strong>{' '}
                <span className="text-gray-800">{document.due_date}</span>
              </p>
            </div>
          </section>
        </>
      )}

      <section className="flex-grow px-4 sm:px-6 lg:px-10">
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-900">
            <tr>
              <th className="p-2 pb-3 font-bold uppercase text-gray-800">Description</th>
              <th className="p-2 pb-3 font-bold uppercase text-gray-800 text-center w-24">Qty</th>
              <th className="p-2 pb-3 font-bold uppercase text-gray-800 text-right w-32">
                Unit Price
              </th>
              <th className="p-2 pb-3 font-bold uppercase text-gray-800 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-2 py-4 font-semibold text-gray-800 whitespace-pre-wrap">{item.description}</td>
                <td className="p-2 py-4 text-center text-gray-800">{item.quantity}</td>
                <td className="p-2 py-4 text-right text-gray-800">${item.price.toFixed(2)}</td>
                <td className="p-2 py-4 text-right font-semibold text-gray-800">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showFooter && (
        <footer className="mt-auto px-4 sm:px-6 lg:px-10">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 lg:w-2/5 py-4 text-gray-800">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-xl text-white bg-gray-900 p-4 rounded-md">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
          {document.notes && (
            <div className="mt-8 py-5 border-t border-gray-200">
              <p className="text-sm text-gray-600">{document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateRetro: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-[#fdf6e3] text-[#586e75] p-4 sm:p-6 lg:p-10 font-mono h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="text-center mb-10 border-y-2 border-dashed border-[#93a1a1] py-4">
            <h1 className="text-4xl font-bold text-[#cb4b16] tracking-wider">
              [ {companyInfo.name} ]
            </h1>
            <p className="whitespace-pre-wrap text-xs mt-2">{companyInfo.address}</p>
          </header>
          <section className="flex justify-between mb-8 text-sm">
            <div>
              <p className="font-bold text-[#b58900]">TO:</p>
              <p>{document.customer?.name}</p>
              <p>{document.customer?.address}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed docNumber to doc_number */}
              <p>
                <span className="font-bold text-[#b58900]">{document.type.toUpperCase()} #:</span>{' '}
                {document.doc_number}
              </p>
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <span className="font-bold text-[#b58900]">ISSUE DATE:</span> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <span className="font-bold text-[#b58900]">{document.type === DocumentType.Quote ? 'VALID TO:' : 'DUE DATE:'}</span> {document.due_date}
              </p>
            </div>
          </section>
        </>
      )}

      <section className="flex-grow">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-1 text-left border-b-2 border-[#93a1a1]">ITEM</th>
              <th className="p-1 text-center border-b-2 border-[#93a1a1]">QTY</th>
              <th className="p-1 text-right border-b-2 border-[#93a1a1]">PRICE</th>
              <th className="p-1 text-right border-b-2 border-[#93a1a1]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-1 pt-2 whitespace-pre-wrap">{item.description}</td>
                <td className="p-1 pt-2 text-center">{item.quantity}</td>
                <td className="p-1 pt-2 text-right">${item.price.toFixed(2)}</td>
                <td className="p-1 pt-2 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-4">
            <div className="w-full sm:w-1/2 text-sm">
              <div className="flex justify-between p-1 border-t border-dashed border-[#93a1a1]">
                <p>Subtotal:</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between p-1">
                <p>Tax ({document.tax}%):</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between p-1 font-bold text-lg border-t-2 border-[#93a1a1] mt-1 text-[#cb4b16]">
                <p>TOTAL:</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
          {document.notes && (
            <div className="mt-8 text-xs border-t border-dashed border-[#93a1a1] pt-4">
              <p>NOTES: {document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateCorporate: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 lg:p-10 font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="flex justify-between items-start pb-6 mb-6 border-b-4 border-blue-700">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-16 w-auto mb-4 object-contain"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h2>
              <p className="text-gray-500 whitespace-pre-wrap text-sm">{companyInfo.address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-blue-700 uppercase">{document.type}</h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-gray-500 mt-1">{document.doc_number || '...'}</p>
            </div>
          </header>
          <section className="grid grid-cols-2 gap-8 my-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                Billed To
              </h3>
              <p className="font-bold text-lg text-gray-900">{document.customer?.name}</p>
              <p className="text-gray-600">{document.customer?.address}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <strong className="text-gray-500">Issue Date:</strong> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <strong className="text-gray-500">Due Date:</strong> {document.due_date}
              </p>
            </div>
          </section>
        </>
      )}
      <section className="flex-grow">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 font-semibold uppercase text-sm">Description</th>
              <th className="p-3 font-semibold uppercase text-sm text-center w-24">Qty</th>
              <th className="p-3 font-semibold uppercase text-sm text-right w-32">Unit Price</th>
              <th className="p-3 font-semibold uppercase text-sm text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                <td className="p-3 text-right font-semibold">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-xl text-blue-700 border-t-2 border-blue-700 pt-2 mt-2">
                <p>Total Due</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
          {document.notes && (
            <div className="mt-10 pt-5 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700">Notes</h3>
              <p className="text-sm text-gray-500">{document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateElegant: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 lg:p-10 font-serif h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-amber-600/20 border-8 border-amber-600/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="text-center mb-10">
            {companyInfo.logo && (
              <img
                src={companyInfo.logo}
                alt="Company Logo"
                className="h-16 w-auto mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-4xl font-normal tracking-widest text-gray-800">
              {companyInfo.name.toUpperCase()}
            </h1>
          </header>
          <div className="w-1/3 h-px bg-amber-500 mx-auto my-8"></div>
          <section className="flex justify-between mb-10">
            <div>
              <h3 className="font-semibold text-gray-600">Billed To</h3>
              <p className="text-lg font-bold text-gray-900">{document.customer?.name}</p>
              <p className="text-gray-600">{document.customer?.address}</p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-800 uppercase">{document.type}</h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-gray-600">{document.doc_number}</p>
              <p className="text-gray-600">{document.doc_number || '...'}</p>
              <p className="mt-4">
                <span className="font-semibold text-gray-600">Date:</span> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <span className="font-semibold text-gray-600">Due:</span> {document.due_date}
              </p>
            </div>
          </section>
        </>
      )}
      <section className="flex-grow">
        <table className="w-full text-left">
          <thead className="border-b-2 border-amber-500">
            <tr>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-gray-600">
                Description
              </th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-center w-24">Qty</th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-right w-32">Price</th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2 py-4">{item.description}</td>
                <td className="p-2 py-4 text-center">{item.quantity}</td>
                <td className="p-2 py-4 text-right">${item.price.toFixed(2)}</td>
                <td className="p-2 py-4 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-xl text-amber-600 border-t-2 border-amber-500 pt-2 mt-2">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </footer>
      )}
    </div>
  );
};

const TemplateFriendly: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 lg:p-10 font-sans h-full flex flex-col overflow-hidden relative">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-green-500/10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-green-500/10 rounded-full"></div>
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <header className="relative z-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-16 w-auto mb-2 object-contain"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h2>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-green-600 uppercase">{document.type}</h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-gray-500">{document.doc_number || '...'}</p>
            </div>
          </div>
          <section className="bg-green-50 rounded-xl p-6 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-1">For</h3>
              <p className="font-bold text-lg text-gray-900">{document.customer?.name}</p>
              <p className="text-gray-600">{document.customer?.address}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <strong className="text-green-800">Date:</strong> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <strong className="text-green-800">Due:</strong> {document.due_date}
              </p>
            </div>
          </section>
        </header>
      )}
      <section className="flex-grow my-8 relative z-10">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 pb-3 font-semibold text-gray-600">Item</th>
              <th className="p-2 pb-3 font-semibold text-gray-600 text-center w-24">Qty</th>
              <th className="p-2 pb-3 font-semibold text-gray-600 text-right w-32">Price</th>
              <th className="p-2 pb-3 font-semibold text-gray-600 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-2 py-3 border-b border-gray-100">{item.description}</td>
                <td className="p-2 py-3 border-b border-gray-100 text-center">{item.quantity}</td>
                <td className="p-2 py-3 border-b border-gray-100 text-right">
                  ${item.price.toFixed(2)}
                </td>
                <td className="p-2 py-3 border-b border-gray-100 text-right font-semibold text-green-700">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto relative z-10">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-4">
            <div className="w-full sm:w-1/2 p-6 bg-green-50 rounded-xl">
              <div className="flex justify-between text-gray-700">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-gray-700 mt-2">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-2xl text-green-700 pt-3 mt-3 border-t-2 border-green-200">
                <p>Amount Due</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </footer>
      )}
    </div>
  );
};

const TemplateTechnical: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-gray-800 p-4 sm:p-6 lg:p-10 font-mono h-full flex flex-col text-sm relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="mb-8">
            <p>
              <span className="text-sky-600">FROM:</span> {companyInfo.name} &lt;{companyInfo.email}
              &gt;
            </p>
            <p>
              <span className="text-sky-600">TO:</span> {document.customer?.name} &lt;
              {document.customer?.email}&gt;
            </p>
            {/* Fix: Changed docNumber to doc_number */}
            <p className="mt-4">
              <span className="text-sky-600">SUBJECT:</span> {document.type} #{document.doc_number}
            </p>
            {/* Fix: Changed issueDate to issue_date */}
            <p>
              <span className="text-sky-600">DATE:</span> {document.issue_date}
            </p>
            {/* Fix: Changed dueDate to due_date */}
            <p>
              <span className="text-sky-600">DUE:</span> {document.due_date}
            </p>
          </header>
          <div className="w-full border-t border-dashed border-gray-400 mb-8"></div>
        </>
      )}
      <section className="flex-grow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-2 text-left text-sky-600">ITEM_DESCRIPTION</th>
              <th className="pb-2 text-center text-sky-600">QTY</th>
              <th className="pb-2 text-right text-sky-600">UNIT_PRICE</th>
              <th className="pb-2 text-right text-sky-600">LINE_TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">{item.description}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">${item.price.toFixed(2)}</td>
                <td className="py-1 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <div className="w-full border-t border-dashed border-gray-400 mt-8"></div>
          <section className="flex justify-end mt-4">
            <div className="w-full sm:w-1/2">
              <p className="flex justify-between">
                <span>SUBTOTAL</span> <span>${document.subtotal.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>TAX ({document.tax}%)</span>{' '}
                <span>${((document.subtotal * document.tax) / 100).toFixed(2)}</span>
              </p>
              <p className="flex justify-between font-bold text-lg mt-2 border-t border-gray-800 pt-1">
                <span>TOTAL</span> <span>${document.total.toFixed(2)}</span>
              </p>
            </div>
          </section>
          {document.notes && (
            <div className="mt-8 text-xs text-gray-500">
              <p>// {document.notes}</p>
            </div>
          )}
        </footer>
      )}
    </div>
  );
};

const TemplateEarthy: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-emerald-50 text-stone-800 p-4 smp-6 lg:p-10 font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-green-500/20 border-8 border-green-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="flex justify-between items-start mb-10">
            <div>
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-16 w-auto mb-2 object-contain"
                />
              )}
              <h2 className="text-3xl font-bold text-emerald-900">{companyInfo.name}</h2>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-stone-700 uppercase">{document.type}</h1>
              {/* Fix: Changed docNumber to doc_number */}
              <p className="text-stone-500">{document.doc_number || '...'}</p>
            </div>
          </header>
          <section className="grid grid-cols-2 gap-8 my-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-600 mb-1">Client</h3>
              <p className="font-bold text-lg text-emerald-800">{document.customer?.name}</p>
              <p className="text-stone-600">{document.customer?.address}</p>
            </div>
            <div className="text-right">
              {/* Fix: Changed issueDate to issue_date */}
              <p>
                <strong className="text-stone-600">Issued:</strong> {document.issue_date}
              </p>
              {/* Fix: Changed dueDate to due_date */}
              <p>
                <strong className="text-stone-600">Due:</strong> {document.due_date}
              </p>
            </div>
          </section>
        </>
      )}
      <section className="flex-grow mt-8">
        <table className="w-full text-left">
          <thead className="border-b-2 border-emerald-800 text-emerald-900">
            <tr>
              <th className="p-2 pb-3 font-semibold uppercase text-sm">Service / Product</th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-center w-24">Qty</th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-right w-32">Rate</th>
              <th className="p-2 pb-3 font-semibold uppercase text-sm text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="p-2 py-3">{item.description}</td>
                <td className="p-2 py-3 text-center">{item.quantity}</td>
                <td className="p-2 py-3 text-right">${item.price.toFixed(2)}</td>
                <td className="p-2 py-3 text-right font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 space-y-2 text-stone-700">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-xl text-emerald-900 border-t-2 border-emerald-800 pt-2 mt-2">
                <p>Total</p>
                <p>${document.total.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </footer>
      )}
    </div>
  );
};

const TemplateSwiss: React.FC<ExtendedPreviewProps> = ({
  document,
  companyInfo,
  items,
  showHeader,
  showFooter,
  profile,
}) => {
  return (
    <div className="bg-white text-black p-4 sm:p-6 lg:p-10 font-sans h-full flex flex-col relative">
      {document.status === DocumentStatus.Paid && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            className="text-8xl font-black text-red-500/20 border-8 border-red-500/20 rounded-full px-8 py-4 transform -rotate-12"
          >
            PAID
          </div>
        </div>
      )}
      {showHeader && (
        <>
          <header className="grid grid-cols-3 gap-8 items-start mb-16">
            <div className="col-span-2">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-12 w-auto mb-4 object-contain"
                />
              )}
              <h2 className="text-2xl font-bold">{companyInfo.name}</h2>
            </div>
            <div className="col-span-1 text-right">
              <h1 className="text-4xl font-bold uppercase">{document.type}</h1>
            </div>
          </header>
          <section className="grid grid-cols-3 gap-8 mb-16">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2">To</h3>
              <p>{document.customer?.name}</p>
              <p className="text-gray-600 text-sm">{document.customer?.address}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Number</h3>
              {/* Fix: Changed docNumber to doc_number */}
              <p>{document.doc_number || '...'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Date</h3>
              {/* Fix: Changed issueDate to issue_date */}
              <p>{document.issue_date}</p>
              {/* Fix: Changed dueDate to due_date */}
              <p className="text-gray-600 text-sm">Due: {document.due_date}</p>
            </div>
          </section>
        </>
      )}
      <section className="flex-grow">
        <table className="w-full text-left">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-3 font-bold uppercase text-sm">Description</th>
              <th className="p-3 font-bold uppercase text-sm text-center w-24">Qty</th>
              <th className="p-3 font-bold uppercase text-sm text-right w-32">Price</th>
              <th className="p-3 font-bold uppercase text-sm text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-3 py-4">{item.description}</td>
                <td className="p-3 py-4 text-center">{item.quantity}</td>
                <td className="p-3 py-4 text-right">${item.price.toFixed(2)}</td>
                <td className="p-3 py-4 text-right">${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showFooter && (
        <footer className="mt-auto">
          {document.type === DocumentType.Invoice && document.stripe_payment_link && document.status !== DocumentStatus.Paid && (
            <div className="my-6 text-center">
              <a
                href={document.stripe_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                Pay Now
              </a>
            </div>
          )}

          <section className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 space-y-2 text-gray-800">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${document.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Tax ({document.tax}%)</p>
                <p>${((document.subtotal * document.tax) / 100).toFixed(2)}</p>
              </div>
            </div>
          </section>
          <section className="mt-4 bg-red-600 text-white p-4 flex justify-between items-center">
            <h3 className="text-2xl font-bold">Total</h3>
            <p className="text-2xl font-bold">${document.total.toFixed(2)}</p>
          </section>
        </footer>
      )}
    </div>
  );
};

const templates: { [key: string]: React.FC<ExtendedPreviewProps> } = {
  modern: TemplateModern,
  classic: TemplateClassic,
  creative: TemplateCreative,
  minimalist: TemplateMinimalist,
  bold: TemplateBold,
  retro: TemplateRetro,
  corporate: TemplateCorporate,
  elegant: TemplateElegant,
  friendly: TemplateFriendly,
  technical: TemplateTechnical,
  earthy: TemplateEarthy,
  swiss: TemplateSwiss,
};

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
          className="bg-white light"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const DocumentPreview: React.FC<PreviewProps> = ({ document, companyInfo, profile }) => {
  // Fix: Changed templateId to template_id
  const SelectedTemplate = templates[document.template_id] || TemplateModern;

  if (!document.customer) {
    return (
      <ScaledPage>
        <div className="bg-white text-slate-800 p-10 font-sans flex items-center justify-center h-full">
          <p className="text-slate-500">Please select a customer to see a preview.</p>
        </div>
      </ScaledPage>
    );
  }

  const ITEMS_PER_FIRST_PAGE = 8;
  const ITEMS_PER_SUBSEQUENT_PAGE = 15;

  if (document.items.length <= ITEMS_PER_FIRST_PAGE) {
    return (
      <ScaledPage>
        <SelectedTemplate
          document={document}
          companyInfo={companyInfo}
          profile={profile}
          items={document.items}
          showHeader={true}
          showFooter={true}
        />
      </ScaledPage>
    );
  }

  const firstPageItems = document.items.slice(0, ITEMS_PER_FIRST_PAGE);
  const remainingItems = document.items.slice(ITEMS_PER_FIRST_PAGE);

  const subsequentPageChunks = [];
  for (let i = 0; i < remainingItems.length; i += ITEMS_PER_SUBSEQUENT_PAGE) {
    subsequentPageChunks.push(remainingItems.slice(i, i + ITEMS_PER_SUBSEQUENT_PAGE));
  }
  const allChunks = [firstPageItems, ...subsequentPageChunks];

  return (
    <>
      {allChunks.map((chunk, index) => (
        <ScaledPage key={index}>
          <SelectedTemplate
            document={document}
            companyInfo={companyInfo}
            profile={profile}
            items={chunk}
            showHeader={index === 0}
            showFooter={index === allChunks.length - 1}
          />
        </ScaledPage>
      ))}
    </>
  );
};

export default DocumentPreview;
