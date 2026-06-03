import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

const FAQ_ITEMS = [
  {
    q: 'Tại sao tôi không nhận được cảnh báo ngập lụt?',
    a: 'Hãy kiểm tra: (1) Bạn đã bật thông báo Push chưa trong Cài đặt > Thông báo. (2) Quyền vị trí đã được đặt thành "Luôn luôn" chưa. (3) Thiết bị có kết nối Internet không. (4) Bán kính cảnh báo đã được thiết lập phù hợp chưa.',
  },
  {
    q: 'Làm thế nào để gửi báo cáo ngập lụt?',
    a: 'Vào tab "Báo cáo" ở thanh điều hướng phía dưới. Nhấn nút "+", chọn vị trí trên bản đồ hoặc dùng vị trí hiện tại, thêm ảnh và mô tả, rồi nhấn Gửi. Báo cáo sẽ được hệ thống xem xét và hiển thị trên bản đồ.',
  },
  {
    q: 'Dữ liệu vị trí của tôi có được bảo mật không?',
    a: 'Có. Chúng tôi chỉ dùng vị trí để gửi cảnh báo và không chia sẻ thông tin định danh với bên thứ ba. Xem Chính sách quyền riêng tư để biết thêm chi tiết.',
  },
  {
    q: 'Làm thế nào để thay đổi mật khẩu?',
    a: 'Vào Cài đặt > Thông tin cá nhân > Đổi mật khẩu. Bạn sẽ cần xác nhận mật khẩu hiện tại trước khi đặt mật khẩu mới.',
  },
  {
    q: 'Bản đồ không hiển thị được, tôi phải làm gì?',
    a: 'Thử các bước sau: (1) Kiểm tra kết nối Internet. (2) Đóng và mở lại ứng dụng. (3) Xóa cache ứng dụng trong Cài đặt điện thoại. (4) Cập nhật ứng dụng lên phiên bản mới nhất. Nếu vẫn lỗi, hãy liên hệ hỗ trợ.',
  },
  {
    q: 'Tôi có thể dùng app mà không cấp quyền vị trí không?',
    a: 'Có, nhưng tính năng cảnh báo ngập theo khu vực của bạn sẽ không hoạt động. Bạn vẫn xem được bản đồ ngập lụt toàn thành phố và gửi báo cáo bằng cách chọn vị trí thủ công.',
  },
];

const GUIDE_ITEMS = [
  {
    step: '01',
    title: 'Cấp quyền vị trí',
    desc: 'Khi được hỏi, chọn "Luôn luôn" để nhận cảnh báo ngay cả khi không mở app.',
    icon: 'location' as const,
    color: '#009688',
  },
  {
    step: '02',
    title: 'Bật thông báo Push',
    desc: 'Vào Cài đặt > Thông báo và bật "Nhận thông báo Push" để không bỏ lỡ cảnh báo.',
    icon: 'notifications' as const,
    color: '#3b82f6',
  },
  {
    step: '03',
    title: 'Xem bản đồ ngập',
    desc: 'Tab Trang chủ hiển thị bản đồ thời gian thực. Các điểm đỏ/vàng là khu vực có ngập.',
    icon: 'map' as const,
    color: '#f59e0b',
  },
  {
    step: '04',
    title: 'Gửi báo cáo cộng đồng',
    desc: 'Tab Báo cáo để chia sẻ tình trạng ngập tại khu vực bạn. Giúp ích cho cả cộng đồng!',
    icon: 'camera' as const,
    color: '#8b5cf6',
  },
];

interface FaqItemProps {
  question: string;
  answer: string;
  last?: boolean;
}

function FaqItem({ question, answer, last }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqItem, !last && styles.faqDivider]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
    >
      <View style={styles.faqRow}>
        <Text style={styles.faqQ}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9ca3af" />
      </View>
      {open && <Text style={styles.faqA}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Trợ giúp & Hỗ trợ" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Guide */}
        <Text style={styles.groupLabel}>HƯỚNG DẪN NHANH</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guideList}
        >
          {GUIDE_ITEMS.map((item) => (
            <View key={item.step} style={styles.guideCard}>
              <View style={[styles.guideStep, { backgroundColor: item.color }]}>
                <Text style={styles.guideStepText}>{item.step}</Text>
              </View>
              <View style={[styles.guideIconCircle, { backgroundColor: `${item.color}1A` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.guideTitle}>{item.title}</Text>
              <Text style={styles.guideDesc}>{item.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* FAQ */}
        <Text style={styles.groupLabel}>CÂU HỎI THƯỜNG GẶP</Text>
        <View style={styles.card}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              question={item.q}
              answer={item.a}
              last={i === FAQ_ITEMS.length - 1}
            />
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.groupLabel}>LIÊN HỆ HỖ TRỢ</Text>
        <View style={styles.card}>
          <ContactRow
            icon="mail"
            iconColor="#3b82f6"
            iconBg="rgba(59,130,246,0.1)"
            title="Email hỗ trợ"
            subtitle="support@floodalert.vn"
            onPress={() => Linking.openURL('mailto:support@floodalert.vn')}
          />
          <ContactRow
            icon="logo-github"
            iconColor="#111827"
            iconBg="rgba(17,24,39,0.08)"
            title="Báo cáo lỗi"
            subtitle="github.com/floodalert/issues"
            onPress={() => {}}
            last
          />
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.noteText}>
            Đội hỗ trợ phản hồi trong vòng <Text style={styles.noteBold}>24 giờ làm việc</Text> (Thứ 2 – Thứ 6, 8:00 – 17:30).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ContactRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.contactRow, !last && styles.contactDivider]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f6' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 0.6,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },

  card: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  guideList: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  guideCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  guideStep: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  guideIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  guideDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  faqItem: { paddingHorizontal: 20, paddingVertical: 16 },
  faqDivider: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 21 },
  faqA: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginTop: 10 },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  contactDivider: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '500', color: '#111827', marginBottom: 2 },
  contactSub: { fontSize: 13, color: '#009688' },

  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 20 },
  noteBold: { fontWeight: '600', color: '#374151' },
});
