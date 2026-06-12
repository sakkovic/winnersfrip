'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import StarRating from './StarRating';
import type { Review } from '@/types';

interface ReviewModalProps {
  onClose: () => void;
  /** The current user's existing review, if any (enables editing). */
  existing?: Review | null;
  /** Called with the saved review for an optimistic UI update. */
  onSubmitted: (review: Review) => void;
}

const MAX = 1000;

export default function ReviewModal({ onClose, existing, onSubmitted }: ReviewModalProps) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || saving) return;
    if (rating < 1) {
      toast.error('Choisissez une note (1 à 5 étoiles).');
      return;
    }
    setSaving(true);
    try {
      const name = currentUser.displayName?.trim() || 'Client';
      const trimmed = comment.trim().slice(0, MAX);
      await setDoc(
        doc(db, 'reviews', currentUser.uid),
        {
          userId: currentUser.uid,
          userName: name,
          userPhoto: currentUser.photoURL ?? null,
          rating,
          comment: trimmed,
          status: 'published',
          updatedAt: serverTimestamp(),
          // Keep the original createdAt on edit; set it once on first write.
          ...(existing ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true },
      );
      onSubmitted({
        id: currentUser.uid,
        userId: currentUser.uid,
        userName: name,
        userPhoto: currentUser.photoURL ?? null,
        rating,
        comment: trimmed,
        status: 'published',
        createdAt: existing?.createdAt ?? Date.now(),
      });
      toast.success('Merci pour votre avis !');
      onClose();
    } catch (err) {
      console.error('review submit failed', err);
      toast.error("Impossible d'enregistrer votre avis. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="review-modal-title" className="text-sm font-bold tracking-widest uppercase">
            {existing ? 'Modifier mon avis' : 'Laisser un avis'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-black transition-colors p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {!currentUser ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600 mb-6">
              Connectez-vous pour partager votre expérience avec Winners Mode.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Votre note</p>
              <StarRating value={rating} onChange={setRating} size={30} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
                Votre commentaire <span className="font-normal text-gray-400 normal-case tracking-normal">(optionnel)</span>
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX))}
                rows={4}
                placeholder="Partagez votre expérience : accueil, conseils, sélection…"
                className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{comment.length}/{MAX}</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-brand-black text-white text-xs font-bold tracking-widest uppercase py-3.5 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {existing ? 'Mettre à jour' : 'Publier mon avis'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
