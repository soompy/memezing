'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ArrowLeft, Upload, X, ImageIcon, AlertCircle, Globe, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import RadioBox from '@/components/ui/RadioBox';
import Tag from '@/components/ui/Tag';
import { useToastContext } from '@/context/ToastContext';

interface UploadForm {
  title: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
  tags: string[];
  isPublic: boolean;
}

export default function CommunityUploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isAddingTagRef = useRef(false);
  const { showSuccess, showError } = useToastContext();
  
  const [form, setForm] = useState<UploadForm>({
    title: '',
    description: '',
    imageFile: null,
    imagePreview: null,
    tags: [],
    isPublic: true
  });
  
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 뒤로가기
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 파일 선택 처리
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: '파일 크기는 10MB 이하여야 합니다.' }));
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: '이미지 파일만 업로드 가능합니다.' }));
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: e.target?.result as string
      }));
      setErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  }, []);

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    setForm(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 태그 추가
  const handleAddTag = useCallback(() => {
    // 중복 실행 방지
    if (isAddingTagRef.current) {
      console.log('Tag adding already in progress, skipping');
      return;
    }

    const tag = tagInput.trim();
    console.log('handleAddTag called with:', tag, 'existing tags:', form.tags);
    
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      isAddingTagRef.current = true;
      console.log('Adding tag:', tag);
      
      // 상태와 DOM 입력값 모두 즉시 클리어
      setTagInput('');
      if (tagInputRef.current) {
        tagInputRef.current.value = '';
      }
      
      setForm(prev => {
        const newTags = [...prev.tags, tag];
        console.log('New tags array:', newTags);
        return {
          ...prev,
          tags: newTags
        };
      });
      
      // 다음 렌더링 사이클 후 플래그 리셋
      setTimeout(() => {
        isAddingTagRef.current = false;
      }, 0);
    } else {
      console.log('Tag not added. Reasons:', {
        emptyTag: !tag,
        duplicate: form.tags.includes(tag),
        tooManyTags: form.tags.length >= 5
      });
    }
  }, [tagInput, form.tags]);

  // 태그 제거
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 폼 검증
  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (form.title.length > 100) {
      newErrors.title = '제목은 100자 이하로 입력해주세요.';
    }

    if (!form.imageFile) {
      newErrors.image = '이미지를 선택해주세요.';
    }

    if (form.description.length > 500) {
      newErrors.description = '설명은 500자 이하로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // 폼 제출
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      console.log('Starting upload with form data:', {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        tags: form.tags,
        hasImageFile: !!form.imageFile,
        imageFileName: form.imageFile?.name,
        imageFileSize: form.imageFile?.size,
        sessionStatus: status,
        hasSession: !!session,
        userEmail: session?.user?.email
      });

      // FormData 생성
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('isPublic', form.isPublic.toString());
      formData.append('tags', JSON.stringify(form.tags));
      
      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      console.log('FormData created, making API call...');

      // API 호출
      const response = await fetch('/api/community/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        showSuccess(data.message || '밈이 성공적으로 업로드되었습니다!');
        router.push('/community?refresh=true');
      } else {
        console.error('Upload failed:', data);
        showError(data.error || '업로드 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [form, validateForm, showSuccess, showError, router, session, status]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="sm" onClick={handleBack}>
                <ArrowLeft size={16} className="mr-2" />
                뒤로가기
              </Button>
              <h1 className="text-gray-900 leading-tight" style={{fontFamily: "'Black Han Sans', sans-serif", fontSize: '1.7rem', fontWeight: 'light'}}>
                밈 업로드
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이미지 업로드 섹션 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">이미지 선택</h2>
            
            {form.imagePreview ? (
              <div className="relative">
                <div className="aspect-square max-w-sm mx-auto relative rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={form.imagePreview}
                    alt="미리보기"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">클릭하여 이미지를 선택하세요</p>
                <p className="text-sm text-gray-500">JPG, PNG, GIF (최대 10MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {errors.image && (
              <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                <AlertCircle size={16} />
                <span>{errors.image}</span>
              </div>
            )}
          </div>

          {/* 제목 및 설명 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="밈의 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{errors.title}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">
                    {form.title.length}/100
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="밈에 대한 설명을 입력하세요 (선택사항)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      <span>{errors.description}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">
                    {form.description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 태그 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">태그</h2>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddTag();
                    }
                  }}
                  placeholder="태그를 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || form.tags.length >= 5}
                  size="sm"
                >
                  추가
                </Button>
              </div>
              
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <Tag
                      key={tag}
                      variant="accent"
                      size="lg"
                      removable
                      onRemove={() => handleRemoveTag(tag)}
                    >
                      #{tag}
                    </Tag>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                최대 5개의 태그를 추가할 수 있습니다. ({form.tags.length}/5)
              </p>
            </div>
          </div>

          {/* 공개 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">공개 설정</h2>
            
            <div className="space-y-3">
              <RadioBox
                name="visibility"
                value="public"
                checked={form.isPublic}
                onChange={() => setForm(prev => ({ ...prev, isPublic: true }))}
                label="공개"
                description="모든 사용자가 볼 수 있습니다"
                icon={<Globe size={18} />}
                variant="card"
              />
              
              <RadioBox
                name="visibility"
                value="private"
                checked={!form.isPublic}
                onChange={() => setForm(prev => ({ ...prev, isPublic: false }))}
                label="비공개"
                description="본인만 볼 수 있습니다"
                icon={<Lock size={18} />}
                variant="card"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleBack}
              className="flex-1"
              disabled={uploading}
            >
              취소
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  업로드
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}