-- RLS политики для Supabase Storage bucket 'tts'
-- Выполните этот скрипт после создания bucket 'tts' в Supabase Dashboard

-- Включаем RLS для storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Политика для загрузки TTS файлов пользователями
CREATE POLICY "Users can upload their own TTS files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Политика для чтения TTS файлов пользователями
CREATE POLICY "Users can read their own TTS files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'tts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Политика для обновления TTS файлов пользователями
CREATE POLICY "Users can update their own TTS files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Политика для удаления TTS файлов пользователями
CREATE POLICY "Users can delete their own TTS files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tts' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Альтернативная политика для более гибкого доступа (если нужно)
-- CREATE POLICY "Authenticated users can access TTS files" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'tts' 
--     AND auth.role() = 'authenticated'
--   );
