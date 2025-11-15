import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import type { Conversation } from '../../types/conversation';

export default function ConversationItem({ conversation, onPress }: { conversation: Conversation; onPress?: () => void }) {
	const title = conversation.title ?? 'Conversation';
	const last = conversation.lastMessage ?? '';
	const time = conversation.lastUpdated ? String(conversation.lastUpdated) : '';
	const unread = conversation.unreadCount ?? 0;

	return (
		<TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
			<View style={styles.left}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{title.charAt(0)}</Text>
				</View>
			</View>

			<View style={styles.middle}>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.last} numberOfLines={1}>{last}</Text>
			</View>

			<View style={styles.right}>
				<Text style={styles.time}>{time}</Text>
				{unread > 0 ? (
					<View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
				) : null}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomColor: '#f4f4f4', borderBottomWidth: 1 },
	left: { width: 56, alignItems: 'center' },
	avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f6ff', alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#0b6efd', fontWeight: '700' },
	middle: { flex: 1, paddingHorizontal: 8 },
	title: { fontWeight: '700' },
	last: { color: '#666', marginTop: 4 },
	right: { width: 72, alignItems: 'flex-end' },
	time: { color: '#999', fontSize: 12 },
	badge: { marginTop: 6, backgroundColor: '#e23b3b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	badgeText: { color: '#fff', fontWeight: '700' },
});
