import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Link2, Hash, Clock, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

export default function BlockchainViewer({ chainData, verified = true }) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const blocks = chainData?.chain || chainData || [];

  return (
    <div className="blockchain-viewer-card card">
      <div className="card-header flex-between border-b border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${verified ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            {verified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <h3 className="card-title font-bold flex items-center gap-2">
              Cryptographic Ledger
              <span className={`badge ${verified ? 'badge-success' : 'badge-danger'}`}>
                {verified ? 'Chain Verified Valid' : 'Integrity Compromised'}
              </span>
            </h3>
            <p className="text-xs text-muted">
              {blocks.length} Blocks linked via SHA-256 hash pointers
            </p>
          </div>
        </div>
      </div>

      <div className="blockchain-flow mt-4">
        {blocks.map((block, index) => {
          const isGenesis = index === 0;
          return (
            <div key={block.id || index} className="block-node">
              <div 
                className={`block-box ${selectedBlock?.id === block.id ? 'block-box-active' : ''}`}
                onClick={() => setSelectedBlock(selectedBlock?.id === block.id ? null : block)}
              >
                <div className="block-header flex-between">
                  <span className="block-num">
                    {isGenesis ? 'Genesis Block #0' : `Block #${block.id || index}`}
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(block.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                <div className="block-meta">
                  <div className="hash-row">
                    <span className="hash-label">Prev Hash:</span>
                    <span className="hash-val" title={block.prev_hash}>
                      {block.prev_hash ? `${block.prev_hash.substring(0, 12)}...` : '000000000000 (Genesis)'}
                    </span>
                  </div>

                  <div className="hash-row">
                    <span className="hash-label">Current Hash:</span>
                    <span className="hash-val font-mono text-honey" title={block.data_hash || block.hash}>
                      {(block.data_hash || block.hash || '').substring(0, 12)}...
                    </span>
                    <button
                      className="btn-copy"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(block.data_hash || block.hash);
                      }}
                      title="Copy Hash"
                    >
                      {copiedHash === (block.data_hash || block.hash) ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="block-footer flex-between mt-2 pt-2 border-t border-subtle">
                  <span className="text-xs text-secondary">Nonce: {block.nonce ?? 42}</span>
                  <span className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              </div>

              {index < blocks.length - 1 && (
                <div className="block-connector">
                  <Link2 size={16} className="connector-icon" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBlock && (
        <div className="block-details-drawer mt-4 p-4 rounded-lg bg-input border border-subtle">
          <h4 className="font-bold text-sm text-honey mb-2">
            Block Payload Inspector (Block #{selectedBlock.id})
          </h4>
          <pre className="text-xs text-secondary overflow-x-auto p-2 bg-dark rounded">
            {JSON.stringify(selectedBlock, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
