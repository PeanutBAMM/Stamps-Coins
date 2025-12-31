import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ExternalLink } from 'lucide-react-native';

interface NewsCardProps {
    title: string;
    summary: string;
    imageUrl?: string;
    source: string;
    category: 'coin' | 'stamp' | 'general';
    publishedAt: string;
    sourceUrl: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
    title,
    summary,
    imageUrl,
    source,
    category,
    publishedAt,
    sourceUrl
}) => {
    const handlePress = () => {
        Linking.openURL(sourceUrl);
    };

    const getCategoryColor = (cat: string): readonly [string, string] => {
        switch (cat) {
            case 'coin': return ['#FFD700', '#DAA520']; // Gold
            case 'stamp': return ['#FF6B6B', '#EE5253']; // Red
            default: return ['#4DA6FF', '#007AFF']; // Blue
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.container}>
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl || 'https://via.placeholder.com/400x200?text=News' }}
                        style={styles.image}
                        contentFit="cover"
                        transition={1000}
                    />
                    <LinearGradient
                        colors={getCategoryColor(category)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryBadge}
                    >
                        <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={styles.source}>{source}</Text>
                        <View style={styles.timeContainer}>
                            <Clock size={12} color="#999" />
                            <Text style={styles.time}>{new Date(publishedAt).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>{title}</Text>
                    <Text style={styles.summary} numberOfLines={3}>{summary}</Text>

                    <View style={styles.footer}>
                        <View style={styles.readMore}>
                            <Text style={styles.readMoreText}>Lees volledig</Text>
                            <ExternalLink size={14} color="#4DA6FF" />
                        </View>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    blurContainer: {
        padding: 0,
    },
    imageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 10,
    },
    contentContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    source: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '600',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    time: {
        color: '#999',
        fontSize: 12,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 24,
    },
    summary: {
        color: '#ddd',
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.9,
    },
    footer: {
        marginTop: 12,
        alignItems: 'flex-end',
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    readMoreText: {
        color: '#4DA6FF',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default NewsCard;
