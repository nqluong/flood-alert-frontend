import { useState } from 'react';
import './SupportPage.css';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Radio,
  Map,
  FileText,
  Users,
  Mail,
  Github,
  ExternalLink,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}


const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Cảm biến',
    question: 'Cảm biến hiển thị trạng thái OFFLINE là do đâu?',
    answer:
      'Cảm biến OFFLINE có thể do mất kết nối mạng, nguồn điện bị gián đoạn, hoặc thiết bị gặp sự cố phần cứng. Hãy kiểm tra kết nối vật lý và nguồn điện tại vị trí cảm biến. Nếu sự cố kéo dài hơn 30 phút, hãy liên hệ nhóm kỹ thuật để kiểm tra thiết bị tại chỗ.',
  },
  {
    category: 'Cảm biến',
    question: 'Làm thế nào để thêm cảm biến mới vào hệ thống?',
    answer:
      'Vào trang "Cảm biến" -> nhấn nút "Thêm cảm biến" -> điền thông tin ID thiết bị, tọa độ vị trí và ngưỡng cảnh báo. Đảm bảo thiết bị đã được cấu hình kết nối MQTT đúng với broker của hệ thống trước khi thêm.',
  },
  {
    category: 'Báo cáo',
    question: 'Khi nào nên duyệt hoặc từ chối một báo cáo từ người dùng?',
    answer:
      'Duyệt báo cáo khi: ảnh rõ ràng, thông tin vị trí chính xác, mô tả phù hợp thực tế và điểm tin cậy (Trust Score) cao. Từ chối khi: ảnh không liên quan, tọa độ sai lệch lớn, hoặc nội dung vi phạm quy định. Điểm Trust Score dưới 40 thường là dấu hiệu cần xem xét kỹ.',
  },
  {
    category: 'Báo cáo',
    question: 'Trust Score (điểm tin cậy) được tính như thế nào?',
    answer:
      'Trust Score được tính dựa trên nhiều yếu tố: lịch sử báo cáo của người dùng, độ khớp với dữ liệu cảm biến gần đó, chất lượng ảnh đính kèm, và xác nhận chéo từ các báo cáo khác trong khu vực. Điểm từ 0–100, trong đó ≥70 được coi là đáng tin cậy cao.',
  },
  {
    category: 'Người dùng',
    question: 'Sự khác biệt giữa vai trò ADMIN và USER?',
    answer:
      'USER là người dùng thông thường có thể xem bản đồ, gửi báo cáo và nhận thông báo. ADMIN có toàn quyền quản trị: phê duyệt báo cáo, quản lý cảm biến, quản lý tài khoản và xem toàn bộ dữ liệu hệ thống. Hãy cân nhắc kỹ khi phân quyền ADMIN.',
  },
  {
    category: 'Hệ thống',
    question: 'WebSocket mất kết nối, dữ liệu không cập nhật thời gian thực?',
    answer:
      'Hệ thống sẽ tự động thử kết nối lại. Nếu sau 60 giây vẫn mất kết nối, hãy thử: (1) tải lại trang, (2) kiểm tra kết nối mạng, (3) xóa cache trình duyệt. Nếu vẫn không kết nối được, hãy kiểm tra trạng thái Notification Service bên dưới.',
  },
];

const QUICK_LINKS = [
  { icon: <Radio size={16} />, label: 'Quản lý Cảm biến', nav: 'sensors' },
  { icon: <Map size={16} />, label: 'Bảng điều khiển', nav: 'dashboard' },
  { icon: <FileText size={16} />, label: 'Kiểm duyệt Báo cáo', nav: 'reports' },
  { icon: <Users size={16} />, label: 'Quản lý Người dùng', nav: 'users' },
];

const FAQ_CATEGORIES = ['Tất cả', 'Cảm biến', 'Báo cáo', 'Người dùng', 'Hệ thống'];

interface SupportPageProps {
  onNavChange?: (id: string) => void;
}

export default function SupportPage({ onNavChange }: SupportPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filteredFaqs =
    activeCategory === 'Tất cả'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === activeCategory);

  return (
    <div className="support-page">
      {/* ---- Header ---- */}
      <div className="support-page__header">
        <div className="support-page__header-left">
          <h2 className="support-page__title">
            <HelpCircle size={22} />
            Trung tâm Hỗ trợ
          </h2>
          <p className="support-page__subtitle">
            Tìm câu trả lời, kiểm tra trạng thái hệ thống và liên hệ nhóm kỹ thuật
          </p>
        </div>
      </div>

      <div className="support-page__body">
        {/* ---- LEFT column ---- */}
        <div className="support-page__main">

          {/* FAQ */}
          <div className="support-card">
            <div className="support-card__head">
              <BookOpen size={16} />
              <h3 className="support-card__title">Câu hỏi thường gặp (FAQ)</h3>
            </div>

            {/* Category filter */}
            <div className="support-faq__categories">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`support-faq__cat-btn ${activeCategory === cat ? 'support-faq__cat-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ list */}
            <div className="support-faq__list">
              {filteredFaqs.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`support-faq__item ${isOpen ? 'support-faq__item--open' : ''}`}>
                    <button
                      className="support-faq__question"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span className="support-faq__category-tag">{item.category}</span>
                      <span className="support-faq__q-text">{item.question}</span>
                      {isOpen ? <ChevronUp size={16} className="support-faq__chevron" /> : <ChevronDown size={16} className="support-faq__chevron" />}
                    </button>
                    {isOpen && (
                      <div className="support-faq__answer">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---- RIGHT column ---- */}
        <div className="support-page__sidebar">

          {/* Quick nav */}
          <div className="support-card">
            <div className="support-card__head">
              <MessageSquare size={16} />
              <h3 className="support-card__title">Điều hướng nhanh</h3>
            </div>
            <div className="support-quicklinks">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.nav}
                  className="support-quicklink__btn"
                  onClick={() => onNavChange?.(link.nav)}
                >
                  {link.icon}
                  {link.label}
                  <ExternalLink size={13} className="support-quicklink__arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="support-card">
            <div className="support-card__head">
              <Mail size={16} />
              <h3 className="support-card__title">Liên hệ hỗ trợ</h3>
            </div>
            <div className="support-contact__list">
              <div className="support-contact__item">
                <Mail size={14} />
                <div>
                  <p className="support-contact__label">Email kỹ thuật</p>
                  <a href="mailto:support@floodguard.vn" className="support-contact__value">
                    support@floodguard.vn
                  </a>
                </div>
              </div>
              <div className="support-contact__item">
                <Github size={14} />
                <div>
                  <p className="support-contact__label">Báo lỗi / Góp ý</p>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="support-contact__value"
                  >
                    GitHub Issues
                    <ExternalLink size={11} style={{ marginLeft: 4 }} />
                  </a>
                </div>
              </div>
            </div>
            <div className="support-contact__note">
              Thời gian phản hồi thông thường: <strong>1–2 ngày làm việc</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
