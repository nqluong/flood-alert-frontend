import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';

interface SectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, iconColor, iconBg, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6b7280"
        />
      </TouchableOpacity>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Quyền riêng tư" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={36} color="#009688" />
          </View>
          <Text style={styles.heroTitle}>Chính sách quyền riêng tư</Text>
          <Text style={styles.heroSub}>Cập nhật lần cuối: 01/01/2025</Text>
        </View>

        <Section
          icon="location"
          iconColor="#009688"
          iconBg="rgba(0,150,136,0.1)"
          title="Dữ liệu chúng tôi thu thập"
        >
          <BulletItem
            icon="navigate-circle"
            color="#009688"
            text="Vị trí địa lý của thiết bị (khi bạn cấp quyền)"
          />
          <BulletItem
            icon="person-circle"
            color="#3b82f6"
            text="Thông tin tài khoản: họ tên, email, số điện thoại"
          />
          <BulletItem
            icon="document-text"
            color="#f59e0b"
            text="Báo cáo ngập lụt bạn gửi (ảnh, mô tả, vị trí)"
          />
          <BulletItem
            icon="phone-portrait"
            color="#8b5cf6"
            text="Thông tin thiết bị: loại máy, phiên bản hệ điều hành"
          />
        </Section>

        <Section
          icon="bulb"
          iconColor="#f59e0b"
          iconBg="rgba(245,158,11,0.1)"
          title="Mục đích sử dụng"
        >
          <BulletItem
            icon="checkmark-circle"
            color="#10b981"
            text="Gửi cảnh báo ngập lụt kịp thời theo vị trí của bạn"
          />
          <BulletItem
            icon="checkmark-circle"
            color="#10b981"
            text="Cải thiện độ chính xác của hệ thống cảnh báo"
          />
          <BulletItem
            icon="checkmark-circle"
            color="#10b981"
            text="Xác thực và hiển thị báo cáo ngập từ cộng đồng"
          />
          <BulletItem
            icon="checkmark-circle"
            color="#10b981"
            text="Gửi thông báo hệ thống quan trọng đến bạn"
          />
        </Section>

        <Section
          icon="share-social"
          iconColor="#8b5cf6"
          iconBg="rgba(139,92,246,0.1)"
          title="Chia sẻ dữ liệu"
        >
          <View style={styles.highlightBox}>
            <Ionicons name="lock-closed" size={16} color="#009688" />
            <Text style={styles.highlightText}>
              Chúng tôi <Text style={styles.bold}>không bán</Text> dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào.
            </Text>
          </View>
          <BulletItem
            icon="business"
            color="#6b7280"
            text="Cơ quan phòng chống lụt bão (số liệu tổng hợp, ẩn danh)"
          />
          <BulletItem
            icon="shield"
            color="#6b7280"
            text="Nhà cung cấp dịch vụ kỹ thuật (bảo mật, lưu trữ đám mây)"
          />
          <BulletItem
            icon="law"
            color="#6b7280"
            text="Cơ quan pháp luật khi có yêu cầu hợp pháp"
          />
        </Section>

        <Section
          icon="key"
          iconColor="#3b82f6"
          iconBg="rgba(59,130,246,0.1)"
          title="Quyền của bạn"
        >
          <FaqItem
            question="Tôi có thể xem dữ liệu của mình không?"
            answer="Có. Vào Cài đặt > Thông tin cá nhân để xem và chỉnh sửa thông tin tài khoản. Dữ liệu báo cáo bạn đã gửi hiển thị trong lịch sử báo cáo."
          />
          <FaqItem
            question="Làm thế nào để xóa tài khoản?"
            answer="Liên hệ đội hỗ trợ qua email support@floodalert.vn kèm yêu cầu xóa tài khoản. Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc và xóa toàn bộ dữ liệu cá nhân."
          />
          <FaqItem
            question="Tôi có thể thu hồi quyền vị trí không?"
            answer="Có. Vào Cài đặt điện thoại > FloodAlert > Vị trí > Đổi thành 'Không bao giờ'. Lưu ý rằng việc này sẽ vô hiệu hóa tính năng cảnh báo theo vị trí."
          />
        </Section>

        <View style={styles.contactCard}>
          <Ionicons name="mail" size={20} color="#009688" />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Liên hệ về quyền riêng tư</Text>
            <Text style={styles.contactEmail}>privacy@floodalert.vn</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BulletItem({
  icon,
  color,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  text: string;
}) {
  return (
    <View style={styles.bulletItem}>
      <Ionicons name={icon} size={16} color={color} style={styles.bulletIcon} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f6' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,150,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: { fontSize: 13, color: '#9ca3af' },

  section: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionBody: { paddingHorizontal: 20, paddingVertical: 12, gap: 10 },

  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletIcon: { marginTop: 1, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 21 },

  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(0,150,136,0.07)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  highlightText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  bold: { fontWeight: '700', color: '#111827' },

  faqItem: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    paddingBottom: 14,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 12,
  },
  contactText: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 2 },
  contactEmail: { fontSize: 13, color: '#009688' },
});
