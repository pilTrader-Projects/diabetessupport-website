import React from 'react';

export interface PublicForumNoticeProps {
  className?: string;
}

/**
 * Public Forum Medical & Privacy Safe Harbor Notice.
 * Warns members against posting confidential medical records or identifiers (RA 10173 & Patient Safety).
 *
 * @usecase Displayed in thread creation and reply dialogs to ensure patient data protection before submission.
 */
export default function PublicForumNotice({ className = '' }: PublicForumNoticeProps): React.JSX.Element {
  return (
    <div
      data-testid="public-forum-notice"
      className={`p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed ${className}`}
    >
      <span className="text-base shrink-0 select-none" aria-hidden="true">
        ⚠️
      </span>
      <span>
        <strong>Public Forum Notice:</strong> Discussions are publicly visible to all members. For your personal privacy and health safety, please do not include confidential medical records, diagnostic lab printouts, or sensitive personal identifiers.
      </span>
    </div>
  );
}
