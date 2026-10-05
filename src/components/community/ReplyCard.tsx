import React from 'react';
import { IReply } from '@/types/community';

interface ReplyCardProps {
  reply: IReply;
  isOp: boolean;
  isYou: boolean;
}

/**
 * Individual Reply Card item for Discussion Thread.
 */
export default function ReplyCard({ reply, isOp, isYou }: ReplyCardProps) {
  const formattedDate = reply.createdAt
    ? new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Just now';

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
      <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800">{reply.authorAlias}</span>
          <span className="text-slate-400 font-mono">{reply.authorTag}</span>
          {isOp && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              OP 👑
            </span>
          )}
          {isYou && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              YOU
            </span>
          )}
        </div>
        <span className="text-slate-400">{formattedDate}</span>
      </div>
      <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
        {reply.content}
      </div>
    </div>
  );
}
