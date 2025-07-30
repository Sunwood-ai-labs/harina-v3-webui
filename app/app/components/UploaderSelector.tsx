'use client'

interface UploaderSelectorProps {
  selectedUploader: string
  setSelectedUploader: (uploader: string) => void
}

export default function UploaderSelector({ selectedUploader, setSelectedUploader }: UploaderSelectorProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
        <div className="flex space-x-2">
          {['夫', '嫁'].map((uploader) => (
            <button
              key={uploader}
              onClick={() => setSelectedUploader(uploader)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${selectedUploader === uploader
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {uploader === '夫' ? '🤵 夫' : '👰 嫁'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}