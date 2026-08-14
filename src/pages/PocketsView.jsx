import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Plus, Pencil, Trash2, Wallet, Tag } from "lucide-react";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import ToastMessage from "../components/ToastMessage";
import PocketFormSheet from "../components/PocketFormSheet";
import PocketAmountSheet from "../components/PocketAmountSheet";
import { useTransactions } from "../hooks/useTransactions";
import { usePockets } from "../hooks/usePockets";

const formatCurrency = (value) => `$${Math.round(Number(value || 0)).toLocaleString("es-CO")}`;

export default function PocketsView() {
  const { summary } = useTransactions();
  const { pockets, loading, totalInPockets, addPocket, updatePocket, deletePocket, deposit, withdraw } =
    usePockets();

  const [formSheet, setFormSheet] = useState({ open: false, pocket: null });
  const [amountSheet, setAmountSheet] = useState({ open: false, mode: "deposit", pocket: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, pocket: null });
  const [toast, setToast] = useState(null);

  const saldoTotal = summary.ingresos - summary.gastos;
  const saldoLibre = saldoTotal - totalInPockets;

  const openCreate = () => setFormSheet({ open: true, pocket: null });
  const openEdit = (pocket) => setFormSheet({ open: true, pocket });
  const closeForm = () => setFormSheet({ open: false, pocket: null });

  const handleFormSubmit = async (data) => {
    if (formSheet.pocket) {
      await updatePocket(formSheet.pocket.id, data);
      setToast({ message: "Bolsillo actualizado", type: "success" });
    } else {
      await addPocket(data);
      setToast({ message: "Bolsillo creado", type: "success" });
    }
  };

  const openDeposit = (pocket) => setAmountSheet({ open: true, mode: "deposit", pocket });
  const openWithdraw = (pocket) => setAmountSheet({ open: true, mode: "withdraw", pocket });
  const closeAmountSheet = () => setAmountSheet({ open: false, mode: "deposit", pocket: null });

  const handleAmountSubmit = async (amount) => {
    const { mode, pocket } = amountSheet;
    if (mode === "deposit") {
      await deposit(pocket.id, amount);
      setToast({ message: "Dinero agregado al bolsillo", type: "success" });
    } else {
      await withdraw(pocket.id, amount);
      setToast({ message: "Dinero retirado del bolsillo", type: "success" });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.pocket) {
      await deletePocket(deleteModal.pocket.id);
      setToast({ message: "Bolsillo eliminado", type: "success" });
    }
    setDeleteModal({ open: false, pocket: null });
  };

  return (
    <Layout title="Bolsillos" subtitle="Aparta dinero de tu saldo para tus metas">
      <div className="space-y-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl border border-divider p-4">
            <p className="text-xs font-semibold text-text-tertiary tracking-wide mb-1">DISPONIBLE LIBRE</p>
            <p className="text-xl font-bold text-text truncate">{formatCurrency(saldoLibre)}</p>
          </div>
          <div className="bg-surface rounded-2xl border border-divider p-4">
            <p className="text-xs font-semibold text-text-tertiary tracking-wide mb-1">EN BOLSILLOS</p>
            <p className="text-xl font-bold text-text truncate">{formatCurrency(totalInPockets)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-divider text-text-secondary hover:bg-hover hover:text-text transition font-medium"
        >
          <Plus size={18} />
          Nuevo bolsillo
        </button>

        {!loading && pockets.length === 0 && (
          <div className="bg-surface rounded-2xl border border-divider p-8 text-center">
            <Wallet size={28} className="mx-auto mb-3 text-text-tertiary" />
            <p className="text-sm text-text-tertiary">
              Todavía no tienes bolsillos. Crea uno para apartar dinero de tus metas.
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {pockets.map((pocket) => {
            const Icon = LucideIcons[pocket.icon] || Tag;
            const hasTarget = Boolean(pocket.targetAmount);
            const percent = hasTarget
              ? Math.max(0, Math.min(100, Math.round((pocket.balance / pocket.targetAmount) * 100)))
              : null;

            return (
              <div key={pocket.id} className="bg-surface rounded-2xl border border-divider p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="p-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${pocket.color}20` }}
                  >
                    <Icon size={20} style={{ color: pocket.color }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text truncate">{pocket.name}</p>
                    <p className="text-lg font-bold text-text truncate">{formatCurrency(pocket.balance)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(pocket)}
                      aria-label="Editar bolsillo"
                      className="cursor-pointer p-2 rounded-lg text-text-secondary hover:bg-hover transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ open: true, pocket })}
                      aria-label="Eliminar bolsillo"
                      className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-hover transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {hasTarget && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                      <span>Meta: {formatCurrency(pocket.targetAmount)}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: pocket.color }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openDeposit(pocket)}
                    className="cursor-pointer py-2 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => openWithdraw(pocket)}
                    disabled={pocket.balance <= 0}
                    className="cursor-pointer py-2 rounded-xl text-sm font-semibold bg-surface-alt text-text-secondary hover:bg-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Retirar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PocketFormSheet
        open={formSheet.open}
        onClose={closeForm}
        pocket={formSheet.pocket}
        onSubmit={handleFormSubmit}
      />

      <PocketAmountSheet
        open={amountSheet.open}
        onClose={closeAmountSheet}
        mode={amountSheet.mode}
        pocket={amountSheet.pocket}
        maxAmount={amountSheet.mode === "deposit" ? saldoLibre : amountSheet.pocket?.balance || 0}
        onSubmit={handleAmountSubmit}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="¿Eliminar bolsillo?"
        message={
          deleteModal.pocket?.balance > 0
            ? `¿Eliminar "${deleteModal.pocket?.name}"? Su saldo de ${formatCurrency(
                deleteModal.pocket?.balance
              )} volverá a tu disponible libre.`
            : `¿Estás seguro de eliminar el bolsillo "${deleteModal.pocket?.name}"?`
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, pocket: null })}
      />

      <ToastMessage
        open={!!toast}
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </Layout>
  );
}
