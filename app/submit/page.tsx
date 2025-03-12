'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createClient } from '@/db/supabase/client'

export default function SubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    website_url: '',
    redbook_url: '',
    creator_name: '',
    creator_redbook_id: '',
    category: 'web',
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.from('redbook_projects').insert({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      })

      if (error) throw error

      toast.success('提交成功！请等待审核')
      router.push('/')
    } catch (error) {
      console.error('提交失败:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">提交你的独立开发项目</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">项目名称 *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </div>

        <div>
          <label className="block mb-2">项目描述 *</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-2">项目网址 *</label>
          <Input
            name="website_url"
            type="url"
            value={formData.website_url}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2">小红书笔记链接 *</label>
          <Input
            name="redbook_url"
            type="url"
            value={formData.redbook_url}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2">创作者名称 *</label>
          <Input
            name="creator_name"
            value={formData.creator_name}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block mb-2">小红书ID *</label>
          <Input
            name="creator_redbook_id"
            value={formData.creator_redbook_id}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="block mb-2">项目分类 *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="web">网站</option>
            <option value="app">应用</option>
            <option value="tool">工具</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">标签（用逗号分隔）</label>
          <Input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="例如：AI, 工具, 效率"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '提交项目'}
        </Button>
      </form>
    </div>
  )
} 