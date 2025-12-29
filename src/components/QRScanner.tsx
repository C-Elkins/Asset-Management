import React, { useRef, useEffect, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface QRPayload {
  v: number
  id: string
  t: 'A' | 'I'
  aid: number
  tag: string
  n: string
  itm?: number
  sn?: string
  cat?: string
  ts: number
  sig?: string
}

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (qrCodeId: string, payload: QRPayload) => Promise<void>
  scanAction: 'view' | 'checkout' | 'checkin' | 'receive' | 'update'
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan, scanAction }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [message, setMessage] = useState('')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const startCamera = async () => {
    setIsInitializing(true)
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setStream(mediaStream)
        setScanning(true)
        setCameraError(null)
      }
    } catch (error: any) {
      console.error('Camera access error:', error)
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError(`Camera error: ${error.message}`)
      }
    } finally {
      setIsInitializing(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setScanning(false)
    }
  }

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code) {
      handleQRDetected(code.data)
    }
  }, [scanning])

  const handleQRDetected = async (data: string) => {
    setScanning(false)

    try {
      const payload: QRPayload = JSON.parse(data)

      // Validate required fields
      if (!payload.v || !payload.id || !payload.t || !payload.aid) {
        throw new Error('Invalid QR code format')
      }

      // Verify signature if present
      if (payload.sig) {
        // Note: In production, implement proper signature verification
        // For now, we trust the signature exists
      }

      await onScan(payload.id, payload)

      setScanResult('success')
      setMessage(`Successfully scanned: ${payload.tag}`)

      setTimeout(() => {
        stopCamera()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('QR scan error:', error)
      setScanResult('error')
      setMessage(error.message || 'Invalid or unrecognized QR code')

      setTimeout(() => {
        setScanResult(null)
        setMessage('')
        setScanning(true)
      }, 2000)
    }
  }

  useEffect(() => {
    if (!scanning) return

    const interval = setInterval(scanFrame, 100)
    return () => clearInterval(interval)
  }, [scanning, scanFrame])

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setScanResult(null)
      setMessage('')
      setCameraError(null)
    }

    return () => stopCamera()
  }, [isOpen])

  if (!isOpen) return null

  const getScanActionLabel = () => {
    switch (scanAction) {
      case 'view':
        return 'Scan to View Asset'
      case 'checkout':
        return 'Scan to Checkout'
      case 'checkin':
        return 'Scan to Check In'
      case 'receive':
        return 'Scan to Receive'
      case 'update':
        return 'Scan to Update'
      default:
        return 'Scan QR Code'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Camera className="text-emerald-600" />
            <h2 className="text-xl font-semibold">{getScanActionLabel()}</h2>
          </div>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {isInitializing ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center" style={{ aspectRatio: '4/3' }}>
              <Loader size={48} className="text-emerald-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-700 font-semibold">Initializing camera...</p>
              <p className="text-sm text-gray-500 mt-2">Please allow camera access when prompted</p>
            </div>
          ) : cameraError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-red-700 font-semibold mb-2">Camera Access Error</p>
              <p className="text-sm text-red-600">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {scanning && !scanResult && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-emerald-500 rounded-lg shadow-lg animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                    <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">Position QR code within frame</p>
                      <p className="text-xs mt-1">Scanning will happen automatically</p>
                    </div>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div
                    className={`bg-white rounded-lg p-6 max-w-sm mx-4 text-center ${
                      scanResult === 'success' ? 'border-4 border-green-500' : 'border-4 border-red-500'
                    }`}
                  >
                    {scanResult === 'success' ? (
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    ) : (
                      <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-semibold">{message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 text-center">
            {scanning
              ? 'Hold steady and position the QR code within the frame'
              : cameraError
              ? 'Please check your camera permissions and try again'
              : isInitializing
              ? 'Accessing camera...'
              : 'Click "Try Again" to restart scanning'}
          </p>
        </div>
      </div>
    </div>
  )
}
