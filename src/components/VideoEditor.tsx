'use client';

import { T } from '@/components/Language';
import { useAdmin } from '@/contexts/AdminContext';
import { Edit3, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VideoEspecial {
  id: number;
  titulo: string;
  video: string;
  descricao?: string;
}

interface VideoEditorProps {
  item: Partial<VideoEspecial> | null;
  onClose: () => void;
  onSave: (item: VideoEspecial) => void;
}

export default function VideoEditor({
  item,
  onClose,
  onSave,
}: VideoEditorProps) {
  const { token } = useAdmin();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isNewItem = !item || !item.id;

  useEffect(() => {
    if (item) {
      setTitulo(item.titulo || '');
      setDescricao(item.descricao || '');
    } else {
      setTitulo('');
      setDescricao('');
      setVideoFile(null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (isNewItem && !videoFile) {
      setError('Selecione um arquivo de vídeo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descricao', descricao);
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const url = isNewItem ? '/api/videos' : `/api/videos/${item.id}`;
      const method = isNewItem ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      const savedItem = await res.json();
      onSave(savedItem);
      onClose();
    } catch (err) {
      setError('Falha ao salvar. Verifique o tamanho do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border rounded-lg shadow-xl max-w-2xl w-full">
        <form onSubmit={handleSubmit}>
          <div className="border-b px-8 py-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Edit3 /> {isNewItem ? 'Novo Vídeo (MP4)' : 'Editar Vídeo'}
            </h2>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>
            )}

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="block text-sm font-medium mb-1">
                <T text={'Título'} />
              </label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border p-3 rounded"
                required
              />
            </div>

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="block text-sm font-medium mb-1">
                <T text={'Arquivo de Vídeo (MP4)'} />{' '}
              </label>
              <div className="border border-dashed p-6 rounded text-center cursor-pointer hover:bg-gray-50 relative">
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Upload className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {videoFile
                      ? videoFile.name
                      : item?.video
                        ? 'Substituir vídeo atual'
                        : 'Clique para selecionar'}
                  </span>
                </div>
              </div>
              {!isNewItem && item?.video && (
                <p className="text-xs text-gray-500 mt-1">
                  <T text={'Atual:'} /> {item.video}
                </p>
              )}
            </div>

            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="block text-sm font-medium mb-1">
                <T text={'Descrição'} />{' '}
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full border p-3 rounded"
                rows={3}
              />
            </div>
          </div>

          <div className="border-t px-8 py-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              <T text={'Cancelar'} />{' '}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded flex gap-2"
            >
              <Save size={18} /> {loading ? 'Enviando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
