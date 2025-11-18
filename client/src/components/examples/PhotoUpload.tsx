import PhotoUpload from '../PhotoUpload';

export default function PhotoUploadExample() {
  return (
    <div className="p-6 max-w-2xl">
      <PhotoUpload
        onUpload={(files) => console.log('Uploaded files:', files)}
        maxFiles={10}
      />
    </div>
  );
}
