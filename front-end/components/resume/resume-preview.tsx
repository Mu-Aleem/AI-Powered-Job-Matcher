'use client';

interface ResumePreviewProps {
  fileName: string;
  fileType: string;
  parsedText: string | null;
  uploadedAt: string;
  onDelete: () => void;
  onReplace: () => void;
}

export function ResumePreview({
  fileName,
  fileType,
  parsedText,
  uploadedAt,
  onDelete,
  onReplace,
}: ResumePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
        <div>
          <p className="font-medium text-sm text-gray-900">{fileName}</p>
          <p className="text-xs text-gray-500">
            {fileType.toUpperCase()} &middot; Uploaded{' '}
            {new Date(uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReplace}
            className="text-sm text-blue-600 hover:underline"
          >
            Replace
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {parsedText && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Parsed Content
          </h3>
          <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {parsedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
