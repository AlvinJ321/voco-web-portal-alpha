import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { NativeSelect } from "./ui/native-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Upload, Send, CheckCircle2, ArrowLeft } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { Toaster } from "./ui/toaster"

interface SupportPageProps {
  user: { username: string; avatarUrl?: string } | null
  onBack: () => void
}

export default function SupportPage({ user, onBack }: SupportPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate system info collection
    const systemInfo = {
      userId: user?.username || "unknown", // In production, get from authenticated user
      appVersion: "v1.2.0 (Build 345)",
      macOSVersion: "macOS 14.1.2 Sonoma",
      deviceModel: "MacBook Pro (14-inch, Nov 2023)",
      processor: "Apple M3 Pro",
      memory: "16 GB",
      inputDevice: "Internal Microphone",
      sampleRate: "44100 Hz",
      micPermission: "Authorized",
    }

    // Create FormData to send files and info
    const formData = new FormData()
    formData.append("category", category)
    formData.append("description", description)
    formData.append("email", email)
    formData.append("systemInfo", JSON.stringify(systemInfo))

    files.forEach((file) => {
      formData.append("attachments", file)
    })

    // Simulate API call
    try {
      // TODO: Replace with actual API endpoint
      // await apiFetch('/api/support', {
      //   method: 'POST',
      //   body: formData,
      // })
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubmitting(false)
      
      // Show success message
      toast({
        title: "工单已提交",
        description: "我们会努力尽快回复您的邮件。如遇咨询高峰，回复可能会有延迟，感谢您的耐心等待。",
      })

      // Reset form after a short delay to ensure toast is visible
      setTimeout(() => {
        setCategory("")
        setDescription("")
        setEmail("")
        setFiles([])
      }, 100)
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "提交失败",
        description: "请稍后重试，或直接发送邮件至 support@vocoapp.co",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <header className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2"
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
      </header>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-balance">帮助与支持</h1>
          <p className="text-muted-foreground text-lg">遇到问题或有建议？我们随时为您提供帮助</p>
        </div>

        <Card className="shadow-lg overflow-visible">
          <CardHeader>
            <CardTitle className="text-2xl">提交工单</CardTitle>
            <CardDescription>请详细描述您的问题，我们会尽快为您解决</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  问题分类 <span className="text-destructive">*</span>
                </Label>
                <NativeSelect
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">请选择问题类型</option>
                  <option value="feature">功能建议</option>
                  <option value="bug">Bug反馈</option>
                  <option value="help">需要帮助</option>
                </NativeSelect>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  问题描述 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述您遇到的问题，包括具体的操作步骤，以及期望的结果。截图能帮助我们更快地定位问题哦~"
                  className="min-h-[160px] resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">提示：提供详细的步骤和截图能帮助我们更快解决问题</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  联系邮箱 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12"
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="attachments" className="text-base font-semibold">
                  附件上传
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.log,.txt"
                  />
                  <Label htmlFor="attachments" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium">点击上传文件或拖拽文件至此处</span>
                    <span className="text-xs text-muted-foreground">支持：图片、PDF、日志文件（最大10MB）</span>
                  </Label>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">已选择 {files.length} 个文件：</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* System Info Notice */}
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  自动收集的系统信息
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  为了更好地帮助您解决问题，我们会自动附带您的应用版本、macOS版本、设备型号、处理器架构、内存大小、输入设备、采样率和麦克风权限状态等信息。这些信息仅用于技术支持。
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold"
                disabled={isSubmitting || !category || !description || !email}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    提交工单
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}

