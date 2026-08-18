import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { useCreateAdminMutation, useUpdateAdminMutation } from '@/hooks/useAdmins'
import { ApiError } from '@/api/httpClient'
import { ADMIN_ROLES, ADMIN_ROLE_LABEL } from '@/types/admin'
import type { Admin } from '@/types/admin'

const createFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Must be at least 8 characters').max(128),
  role: z.enum(ADMIN_ROLES),
  isActive: z.boolean(),
})

const editFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string(),
  password: z.string().max(128).refine((v) => v === '' || v.length >= 8, 'Must be at least 8 characters'),
  role: z.enum(ADMIN_ROLES),
  isActive: z.boolean(),
})

type AdminFormValues = z.infer<typeof createFormSchema>

interface AdminFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin?: Admin
  currentAdminId: string
}

export function AdminFormDialog({ open, onOpenChange, admin, currentAdminId }: AdminFormDialogProps) {
  const isEditMode = Boolean(admin)
  const isEditingSelf = admin?.id === currentAdminId
  const createMutation = useCreateAdminMutation()
  const updateMutation = useUpdateAdminMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(isEditMode ? editFormSchema : createFormSchema),
    defaultValues: {
      name: admin?.name ?? '',
      email: admin?.email ?? '',
      password: '',
      role: admin?.role ?? 'staff',
      isActive: admin?.is_active ?? true,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditMode && admin) {
        await updateMutation.mutateAsync({
          id: admin.id,
          input: {
            name: values.name,
            password: values.password || undefined,
            ...(isEditingSelf ? {} : { role: values.role, isActive: values.isActive }),
          },
        })
        toast.success('Admin updated')
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        })
        toast.success('Admin created')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  })

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit admin' : 'Add admin'}
      description={isEditMode ? "Update this admin's details." : 'Create a new admin user.'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="Jane Doe"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              placeholder="jane@gummies.local"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {isEditMode ? 'New password (optional)' : 'Password'}
          </label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder={isEditMode ? 'Leave blank to keep current password' : 'At least 8 characters'}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            {...register('role')}
            disabled={isEditingSelf}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>
                {ADMIN_ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </div>

        {isEditMode && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              {...register('isActive')}
              disabled={isEditingSelf}
              className="size-4 rounded border-slate-300 disabled:cursor-not-allowed"
            />
            Active
          </label>
        )}

        {isEditingSelf && (
          <p className="text-xs text-slate-500">You cannot change your own role or deactivate your own account.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save changes' : 'Create admin'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
