import { useCallback, useEffect, useRef, useState } from 'react';
import './UsersPage.css';
import type {
  UserFilters,
  UserSummaryResponse,
  PageResponse,
} from '../../types/user.types';
import { userService } from '../../services/user.service';
import UserTable from './components/UserTable/UserTable';
import UserFiltersBar from './components/UserFilters/UserFilters';
import UserDetailModal from './components/UserDetailModal/UserDetailModal';
import ChangeStatusModal from './components/ChangeStatusModal/ChangeStatusModal';
import AssignRoleModal from './components/AssignRoleModal/AssignRoleModal';
import Pagination from '../../components/Pagination/Pagination';
import { Users as UsersIcon } from 'lucide-react';

const DEFAULT_FILTERS: UserFilters = {
  search: '',
  role: 'all',
  status: 'all',
  emailVerified: 'all',
  authProvider: 'all',
};

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<UserSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserSummaryResponse | null>(null);
  const [toggleUser, setToggleUser] = useState<UserSummaryResponse | null>(null);
  const [managingRoleUser, setManagingRoleUser] = useState<UserSummaryResponse | null>(null);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

  // Reset về trang 0 khi filter thay đổi
  useEffect(() => {
    setPage(0);
  }, [filters.role, filters.status, filters.emailVerified, filters.authProvider, debouncedSearch]);

  // Fetch dữ liệu
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Chuẩn bị roles array
      const roles = filters.role !== 'all' ? [filters.role] : undefined;
      
      // Chuẩn bị emailVerified boolean
      const emailVerified = 
        filters.emailVerified === 'true' ? true :
        filters.emailVerified === 'false' ? false :
        undefined;

      const data = await userService.getUsers({
        page,
        size: PAGE_SIZE,
        keyword: debouncedSearch || undefined,
        roles,
        status: filters.status !== 'all' ? filters.status : undefined,
        emailVerified,
        authProvider: filters.authProvider !== 'all' ? filters.authProvider : undefined,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      });
      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, filters.role, filters.status, filters.emailVerified, filters.authProvider, debouncedSearch]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Stats từ trang hiện tại
  const users = pageData?.content ?? [];
  const totalActive = users.filter((u) => u.status === 'ACTIVE').length;
  const totalLocked = users.filter((u) => u.status === 'LOCKED').length;
  const totalPending = users.filter((u) => u.status === 'PENDING').length;
  const totalAdmins = users.filter((u) => u.roles === 'ADMIN').length;

  return (
    <div className="users-page">
      {/* ---- Top bar ---- */}
      <div className="users-page__top">
        <div>
          <h2 className="users-page__title">
            <UsersIcon size={24} style={{ marginRight: 8 }} />
            Quản lý Người dùng
            {pageData && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--color-text-muted)',
                  marginLeft: 8,
                }}
              >
                ({pageData.totalElements} người dùng)
              </span>
            )}
          </h2>
          <div className="users-page__stats">
            {totalActive > 0 && (
              <span className="users-stat users-stat--active">
                <span className="users-stat__dot" />
                {totalActive} hoạt động
              </span>
            )}
            {totalLocked > 0 && (
              <span className="users-stat users-stat--locked">
                <span className="users-stat__dot" />
                {totalLocked} bị khóa
              </span>
            )}
            {totalPending > 0 && (
              <span className="users-stat users-stat--pending">
                <span className="users-stat__dot" />
                {totalPending} chờ xác thực
              </span>
            )}
            {totalAdmins > 0 && (
              <span className="users-stat users-stat--admin">
                <span className="users-stat__dot" />
                {totalAdmins} quản trị viên
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- Filter bar ---- */}
      <UserFiltersBar filters={filters} onChange={setFilters} />

      {/* ---- Error banner ---- */}
      {error && (
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--color-danger-bg, #fef2f2)',
            color: 'var(--color-danger, #ef4444)',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          ⚠ {error}
          <button
            onClick={() => void fetchUsers()}
            style={{
              marginLeft: 10,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ---- Table card ---- */}
      <div className="users-page__card">
        <UserTable
          users={users}
          loading={loading}
          onView={(user) => setViewingUser(user)}
          onToggleStatus={(user) => setToggleUser(user)}
          onManageRoles={(user) => setManagingRoleUser(user)}
        />

        {/* ---- Pagination ---- */}
        <Pagination
          currentPage={page}
          totalPages={pageData?.totalPages ?? 0}
          totalElements={pageData?.totalElements ?? 0}
          isFirstPage={pageData?.first ?? true}
          isLastPage={pageData?.last ?? true}
          onPageChange={setPage}
          itemLabel="người dùng"
        />
      </div>

      {/* ---- User Detail Modal ---- */}
      {viewingUser && (
        <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      {/* ---- Change Status Modal ---- */}
      {toggleUser && (
        <ChangeStatusModal
          user={toggleUser}
          onClose={() => setToggleUser(null)}
          onSuccess={() => {
            setToggleUser(null);
            void fetchUsers();
          }}
        />
      )}

      {/* ---- Assign Role Modal ---- */}
      {managingRoleUser && (
        <AssignRoleModal
          user={managingRoleUser}
          onClose={() => setManagingRoleUser(null)}
          onSuccess={() => {
            setManagingRoleUser(null);
            void fetchUsers();
          }}
        />
      )}
    </div>
  );
}
