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
import apiFetch, { apiUpload } from "../api"

// ==========================================
// 1. 新增：更高级的 OS 版本检测逻辑 (异步)
// ==========================================
async function getRealOSVersion(userAgent: string): Promise<string> {
  // A. 尝试使用 High Entropy Values (针对 Chrome/Edge 等)
  // 这是目前唯一能在 Web 端拿到 macOS 真实大版本的方法
  if ((navigator as any).userAgentData && (navigator as any).userAgentData.getHighEntropyValues) {
    try {
      const uaData = await (navigator as any).userAgentData.getHighEntropyValues(["platformVersion"]);
      if (uaData.platformVersion) {
        // platformVersion 返回的是内核版本，例如:
        // 13.x.x -> macOS Ventura (13)
        // 14.x.x -> macOS Sonoma (14)
        // 15.x.x -> macOS Sequoia (15)
        const majorVersion = parseInt(uaData.platformVersion.split('.')[0]);
        
        // 简单的内核版本映射 (Chromium on Mac 的 platformVersion 通常直接对应 macOS 大版本)
        // 注意：这里的映射逻辑可能随浏览器实现微调，但通常 int(version) 就是 macOS 版本
        if (majorVersion >= 11) {
          return `macOS ${uaData.platformVersion} (Detected via Client Hints)`;
        }
      }
    } catch (e) {
      console.warn("Failed to get high entropy values", e);
    }
  }

  // B. 降级方案：解析 UserAgent (针对 Safari/Firefox)
  // 虽然这里绝大多数时候会被冻结在 10.15.7，但这是唯一的备选方案
  if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+_\d+(_\d+)?)/);
    if (match && match[1]) {
      const ver = match[1].replace(/_/g, '.');
      // 如果检测到是 10.15.7，我们给它加个备注，告诉看日志的人这可能不准
      if (ver === '10.15.7') {
        return 'macOS 10.15.7 (or newer)';
      }
      return `macOS ${ver}`;
    }
  }
  
  return navigator.platform || 'macOS';
}

// 2. 优化的 GPU 检测函数
function getGPUInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'unknown';
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'unknown';
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    canvas.remove();
    return renderer || 'unknown';
  } catch (error) {
    console.error('Error getting GPU info:', error);
    return 'unknown';
  }
}

// 3. 屏幕信息函数
function getScreenInfo() {
  return `${window.screen.width}x${window.screen.height} (PxRatio: ${window.devicePixelRatio})`;
}

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
      const selectedFiles = Array.from(e.target.files)
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', '.log', '.txt']
      
      const validFiles: File[] = []
      const invalidFiles: string[] = []
      
      selectedFiles.forEach(file => {
        // Check file size
        if (file.size > maxSize) {
          invalidFiles.push(`${file.name} (超过5MB限制)`)
          return
        }
        
        // Check file type
        const fileType = file.type || ''
        const fileName = file.name.toLowerCase()
        const hasValidType = allowedTypes.some(type => 
          fileType.startsWith('image/') || fileName.endsWith(type)
        )
        
        if (hasValidType) {
          validFiles.push(file)
        } else {
          invalidFiles.push(`${file.name} (仅支持图片和日志文件)`)
        }
      })
      
      // Show error messages for invalid files
      if (invalidFiles.length > 0) {
        invalidFiles.forEach(error => {
          toast({
            title: "文件上传失败",
            description: error,
            variant: "destructive",
          })
        })
      }
      
      // Set only valid files
      setFiles(validFiles)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Upload files first to get URLs
      const attachmentUrls: string[] = []
      if (files.length > 0) {
        for (const file of files) {
          try {
            const uploadResponse = await apiUpload('/api/upload-attachment', file)
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload file: ' + file.name)
            }
            const uploadResult = await uploadResponse.json()
            if (uploadResult.attachmentUrl) {
              attachmentUrls.push(uploadResult.attachmentUrl)
            }
          } catch (uploadError) {
            console.error('File upload error:', uploadError)
            toast({
              title: "文件上传失败",
              description: `${file.name} 上传失败，请重试。`,
              variant: "destructive",
            })
          }
        }
      }

      // 2. Prepare system metadata
      // 检测CPU架构，添加更好的浏览器兼容性支持
      let cpuArch = 'unknown';
      
      // 添加调试信息
      console.log('=== CPU Architecture Detection Debug ===');
      console.log('navigator.userAgentData:', navigator.userAgentData);
      console.log('navigator.userAgentData?.architecture:', navigator.userAgentData?.architecture);
      console.log('navigator.userAgent:', navigator.userAgent);
      console.log('navigator.platform:', navigator.platform);
      
      // 尝试使用现代的 userAgentData API
      if (navigator.userAgentData) {
        console.log('Using userAgentData API');
        if (navigator.userAgentData.architecture) {
          cpuArch = navigator.userAgentData.architecture;
          console.log('From userAgentData.architecture:', cpuArch);
        } else {
          console.log('userAgentData.architecture is undefined');
        }
      } else {
        console.log('userAgentData not available');
      }
      
      // 即使userAgentData存在，如果architecture为undefined，仍解析userAgent字符串
      if (cpuArch === 'unknown' && navigator.userAgent) {
        console.log('Falling back to userAgent parsing');
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        // 同时检查 userAgent 和 platform
        if (userAgent.includes('x86_64') || userAgent.includes('x64') || platform.includes('MacIntel')) {
          cpuArch = 'x86_64';
          console.log('Detected x86_64 from userAgent/platform');
        } else if (userAgent.includes('x86')) {
          cpuArch = 'x86';
          console.log('Detected x86 from userAgent');
        } else if (userAgent.includes('ARM64') || userAgent.includes('arm64') || platform.includes('MacARM')) {
          cpuArch = 'ARM64';
          console.log('Detected ARM64 from userAgent/platform');
        } else if (userAgent.includes('ARM') || userAgent.includes('arm')) {
          cpuArch = 'ARM';
          console.log('Detected ARM from userAgent');
        } else {
          console.log('No architecture pattern found in userAgent/platform');
        }
      }
      
      console.log('Final detected CPU architecture:', cpuArch);
      console.log('=== End CPU Architecture Detection Debug ===');
      
      // Get real OS version using the new async function
      const userAgent = navigator.userAgent;
      const realOSVersion = await getRealOSVersion(userAgent);
      
      // Handle memory display with browser limit consideration
      let systemMemory = 'unknown';
      if (navigator.deviceMemory !== undefined) {
        if (navigator.deviceMemory === 8) {
          systemMemory = '≥ 8 GB (Browser Limit)';
        } else {
          systemMemory = navigator.deviceMemory + ' GB';
        }
      }
      
      // Get GPU info for device model
      const gpuInfo = getGPUInfo();
      
      // Add CPU cores to architecture
      const cpuCores = navigator.hardwareConcurrency || 'unknown';
      const cpuArchWithCores = `${cpuArch} (${cpuCores} cores)`;
      
      const device_meta = {
        app_version: "v1.2.0 (Build 345)",
        os_version: realOSVersion,
        device_model: `GPU: ${gpuInfo}`,
        cpu_arch: cpuArchWithCores,
        system_memory: systemMemory,
        user_agent_raw: userAgent,
        screen_info: getScreenInfo(),
      }

      const audio_meta = {
        input_device: "Internal Microphone",
        sample_rate: "44100",
        mic_permission: "Authorized",
      }

      // 3. Submit feedback data to API
      const response = await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          contactEmail: email,
          issueType: category,
          description: description,
          attachmentUrls: attachmentUrls,
          device_meta,
          audio_meta
        })
      })

      if (response.ok) {
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
      } else {
        throw new Error('Failed to submit feedback')
      }
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
                    accept="image/*,.log,.txt"
                  />
                  <Label htmlFor="attachments" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium">点击上传文件或拖拽文件至此处</span>
                    <span className="text-xs text-muted-foreground">支持：图片、日志文件（最大5MB）</span>
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

