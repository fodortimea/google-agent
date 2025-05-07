import Image from "next/image";

const FilePreview = ({
  files,
  onRemove,
}: {
  files: { id: string; file: File }[];
  onRemove: (id: string) => void;
}) => (
  <>
    {files.map((file) => (
      <div key={file.id} className="relative">
        <div className="w-10 h-10 object-cover rounded border overflow-hidden flex items-center justify-center">
          {file.file.type.startsWith("image/") ? (
            <Image
              src={URL.createObjectURL(file.file)}
              alt="Preview"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              🎵
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          className="absolute top-0 right-0 text-white bg-black/50 rounded-full w-4 h-4 flex items-center justify-center font-bold"
        >
          ✕
        </button>
      </div>
    ))}
  </>
);

export default FilePreview;
