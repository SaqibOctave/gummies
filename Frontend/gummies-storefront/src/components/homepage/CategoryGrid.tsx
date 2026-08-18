import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import type { Category } from '@/types/category'

interface CategoryGridProps {
  title: string | null
  categories: Category[]
}

export function CategoryGrid({ title, categories }: CategoryGridProps) {
  if (categories.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title ?? 'Shop by category'}</h2>
      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-center transition hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-slate-100">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.image_alt_text ?? category.name}
                  className="size-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-slate-300">
                  <ImageOff size={28} />
                </div>
              )}
            </div>
            <p className="p-3 text-sm font-medium text-slate-900">{category.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
