'use client';

import { T } from '@/components/Language';
import { useAdmin } from '@/contexts/AdminContext';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import VideoEditor from './VideoEditor';

interface VideoEspecial {
  id: number;
  titulo: string;
  video: string;
  descricao?: string;
}

export default function GallerySection() {
  const [items, setItems] = useState<VideoEspecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoEspecial | null>(null);
  const { isAdmin, token } = useAdmin();

  useEffect(() => {
    fetch('/api/videos')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveItem = (savedItem: VideoEspecial) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === savedItem.id ? savedItem : i)),
      );
    } else {
      setItems((prev) => [savedItem, ...prev]);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!token || !confirm('Confirmar exclusão?')) return;
    const res = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <T text={'Carregando...'} />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">
          <T text={'Galeria de Vídeos'} />
        </h1>
        {isAdmin && (
          // biome-ignore lint/a11y/useButtonType: <explanation>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowEditor(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded"
          >
            <Plus size={20} /> <T text={'Adicionar Vídeo'} />{' '}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group bg-white rounded-lg shadow overflow-hidden mx-auto w-full max-w-[300px]"
          >
            <div
              className="w-full bg-black relative"
              style={{ paddingTop: '177.78%' }}
            >
              <ReactPlayer
                src={item.video}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                controls
              />
            </div>

            <div className="p-4">
              <h3 className="font-bold truncate">
                <T text={item.titulo} />
              </h3>
              {item.descricao && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  <T text={item.descricao} />
                </p>
              )}
            </div>

            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setShowEditor(true);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-full shadow"
                >
                  <Edit size={14} />
                </button>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 bg-red-600 text-white rounded-full shadow"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showEditor && (
        <VideoEditor
          item={editingItem}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}
