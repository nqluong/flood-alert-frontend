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

const TERMS = [
  {
    id: '1',
    title: 'Chấp thuận điều khoản',
    icon: 'checkmark-circle' as const,
    color: '#10b981',
    content:
      'Bằng cách tải xuống, cài đặt hoặc sử dụng ứng dụng FloodGuard, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng ứng dụng.',
  },
  {
    id: '2',
    title: 'Mục đích sử dụng',
    icon: 'phone-portrait' as const,
    color: '#3b82f6',
    content:
      'FloodGuard được thiết kế để hỗ trợ cảnh báo ngập lụt và chia sẻ thông tin cộng đồng. Bạn đồng ý chỉ sử dụng ứng dụng cho các mục đích hợp pháp và không sử dụng để gửi thông tin sai lệch, gây hoang mang hoặc làm hỏng hệ thống cảnh báo.',
  },
  {
    id: '3',
    title: 'Độ chính xác thông tin',
    icon: 'alert-circle' as const,
    color: '#f59e0b',
    content:
      'Thông tin cảnh báo ngập lụt trên ứng dụng được tổng hợp từ cảm biến IoT và báo cáo cộng đồng. Chúng tôi nỗ lực đảm bảo độ chính xác nhưng không thể đảm bảo thông tin luôn hoàn toàn chính xác hoặc cập nhật tức thời. Người dùng cần tự đánh giá tình huống thực tế.',
  },
  {
    id: '4',
    title: 'Quyền riêng tư & dữ liệu',
    icon: 'shield-checkmark' as const,
    color: '#009688',
    content:
      'Việc thu thập và xử lý dữ liệu cá nhân (bao gồm vị trí địa lý) được thực hiện theo Chính sách quyền riêng tư của chúng tôi. Bằng cách sử dụng ứng dụng, bạn đồng ý với việc thu thập và sử dụng dữ liệu như đã mô tả trong chính sách đó.',
  },
  {
    id: '5',
    title: 'Giới hạn trách nhiệm',
    icon: 'information-circle' as const,
    color: '#8b5cf6',
    content:
      'FloodGuard và các nhà phát triển không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc hệ quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng ứng dụng, bao gồm cả các quyết định được đưa ra dựa trên thông tin từ ứng dụng.',
  },
  {
    id: '6',
    title: 'Tài khoản người dùng',
    icon: 'person-circle' as const,
    color: '#ec4899',
    content:
      'Bạn chịu trách nhiệm bảo mật tài khoản của mình và mọi hoạt động diễn ra dưới tài khoản đó. Vui lòng thông báo ngay cho chúng tôi nếu phát hiện hành vi sử dụng trái phép tài khoản. Chúng tôi có quyền đình chỉ tài khoản vi phạm điều khoản.',
  },
  {
    id: '7',
    title: 'Thay đổi điều khoản',
    icon: 'refresh-circle' as const,
    color: '#6b7280',
    content:
      'Chúng tôi có quyền thay đổi các Điều khoản sử dụng này bất kỳ lúc nào. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua ứng dụng hoặc email. Việc tiếp tục sử dụng ứng dụng sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp thuận các thay đổi đó.',
  },
];

interface TermItemProps {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  content: string;
}

function TermItem({ id, title, icon, color, content }: TermItemProps) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.termItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.7}
    >
      <View style={styles.termHeader}>
        <View style={[styles.termIconCircle, { backgroundColor: `${color}1A` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View style={styles.termLabelWrap}>
          <Text style={styles.termNum}>Điều {id}</Text>
          <Text style={styles.termTitle}>{title}</Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9ca3af"
        />
      </View>
      {open && (
        <View style={styles.termBody}>
          <Text style={styles.termContent}>{content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TermsScreen() {
  const [allOpen, setAllOpen] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Điều khoản sử dụng" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={36} color="#009688" />
          </View>
          <Text style={styles.heroTitle}>Điều khoản sử dụng</Text>
          <Text style={styles.heroSub}>Có hiệu lực từ ngày 01/01/2025</Text>
          <Text style={styles.heroDesc}>
            Vui lòng đọc kỹ trước khi sử dụng ứng dụng FloodGuard.
          </Text>
        </View>

        {/* Toggle all */}
        <TouchableOpacity
          style={styles.toggleAll}
          onPress={() => setAllOpen(!allOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleAllText}>
            {allOpen ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
          </Text>
          <Ionicons
            name={allOpen ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
            size={18}
            color="#009688"
          />
        </TouchableOpacity>

        {/* Terms list */}
        <View style={styles.card}>
          {TERMS.map((item, idx) => (
            <ExpandableTermItem
              key={item.id}
              {...item}
              forceOpen={allOpen}
              last={idx === TERMS.length - 1}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-half" size={16} color="#9ca3af" />
          <Text style={styles.footerText}>
            Bằng cách sử dụng FloodGuard, bạn đồng ý với toàn bộ các điều khoản trên.
            Để biết thêm thông tin, liên hệ{' '}
            <Text style={styles.footerEmail}>legal@floodguard.vn</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ExpandableTermItem({
  id,
  title,
  icon,
  color,
  content,
  forceOpen,
  last,
}: TermItemProps & { forceOpen: boolean; last?: boolean }) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = forceOpen || localOpen;

  return (
    <TouchableOpacity
      style={[styles.termItem, !last && styles.termDivider]}
      onPress={() => setLocalOpen(!localOpen)}
      activeOpacity={0.7}
    >
      <View style={styles.termHeader}>
        <View style={[styles.termIconCircle, { backgroundColor: `${color}1A` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View style={styles.termLabelWrap}>
          <Text style={styles.termNum}>Điều {id}</Text>
          <Text style={styles.termTitle}>{title}</Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9ca3af"
        />
      </View>
      {isOpen && (
        <View style={styles.termBody}>
          <Text style={styles.termContent}>{content}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f6' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
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
  heroSub: { fontSize: 13, color: '#9ca3af', marginBottom: 10 },
  heroDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 21,
  },

  toggleAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  toggleAllText: { fontSize: 13, fontWeight: '500', color: '#009688' },

  card: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  termItem: { paddingHorizontal: 20, paddingVertical: 16 },
  termDivider: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  termHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  termIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  termLabelWrap: { flex: 1 },
  termNum: { fontSize: 11, fontWeight: '600', color: '#9ca3af', letterSpacing: 0.4, marginBottom: 2 },
  termTitle: { fontSize: 15, fontWeight: '500', color: '#111827', letterSpacing: -0.2 },
  termBody: {
    marginTop: 12,
    marginLeft: 48,
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  termContent: { fontSize: 13, color: '#374151', lineHeight: 21 },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footerText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 20 },
  footerEmail: { color: '#009688', fontWeight: '500' },
});
