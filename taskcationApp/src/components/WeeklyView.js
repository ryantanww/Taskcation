// Import dependencies and libraries used in Weekly View
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { format, startOfWeek, addDays, getWeek, getHours, isSameDay } from 'date-fns';

const WeeklyView = ({ selectedDate, tasks, onTaskPress, onPrevWeek, onNextWeek  }) => {
    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // Reference for scrolling to current hour
    const scrollViewRef = useRef(null);

    // Determine the week of the selected date to ensure that full weeks are shown
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    // Store the current week number
    const weekNum = getWeek(selectedDate);

    // Generate aan array of 7 days from the current week
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Store the hours of the day in a 12 hour format to display
    const hours = [
        '1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM',
        '1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','12 AM',
    ];

    // useEffect to automatically scroll to the current hour when the screen is focused
    useEffect(() => {
        if (isFocused && scrollViewRef.current) {
            // Get current date
            const now = new Date();
            // Get current time
            const localHour = now.getHours();

            // Store the target index of the hour
            let targetIndex = 0;
            // Check which index is the current hour at and store it as the target index
            for (let i = 0; i < hours.length; i++) {
                if (parseHour(hours[i]) === localHour) {
                    targetIndex = i;
                    break;
                }
            }
            
            // Minimum row height of cells
            const rowHeight = 70;
            // Scroll to current hour based on the targetIndex and rowHeight
            scrollViewRef.current.scrollTo({ y: targetIndex * rowHeight, animated: false });
        }
    }, [isFocused, hours]);

    
    // Function to convert  hour labels into 24 hour format
    function parseHour(hourLabel) {
        // Split the hour label into the hour part and the AM and PM
        const [hourStr, suffix] = hourLabel.split(' ');

        // Convert it into an integer
        let hourNum = parseInt(hourStr, 10);
    
        // If suffix is AM
        if (suffix === 'AM') {
            // If 12AM, it should be converted into 0 for midnight
            if (hourNum === 12) {
                hourNum = 0;
            }
        // Else add 12 to the hour except for 12PM
        } else if (suffix === 'PM') {
            if (hourNum !== 12) {
                hourNum += 12;
            }
        }
        return hourNum; 
    }

    

    // Function to filter tasks that have an end_date matching the provided date and hour
    function getDayHourTasks(day, hourLabel) {
        const targetHour = parseHour(hourLabel);
        return tasks.filter((task) => {
            if (!task.end_date) return false;
            if (!isSameDay(task.end_date, day)) return false;
        
            const taskHour = getHours(task.end_date);
            return taskHour === targetHour;
        });
    }

    // Function to render the task list items inside the corresponding day and time in the weekly calendar
    function renderDayHourTask(task) {
        return (
            // Allows users to navigate to TaskDetailScreen screen when clicked
            <TouchableOpacity style={[styles.dayTask, task.status && styles.dayTaskCompleted]} onPress={() => onTaskPress(task.id)}>
                {/* Task name */}
                <Text style={[styles.dayTaskText, task.status && styles.dayTaskTextCompleted]} numberOfLines={1} ellipsizeMode='tail'>
                    {task.task_name}
                </Text>

                {/* Strike through line only when task is completed */}
                {task.status && <View style={styles.dayTaskStrikeThrough} testID={`strikeThrough-${task.id}`} />}
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            {/* Render the month and year with buttons to move back to previous week or forward to next week */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.navButton} onPress={onPrevWeek} testID={'prev-week'}>
                    <Ionicons name='caret-back-outline' size={32} color='#8B4513' />
                </TouchableOpacity>
                <Text style={styles.headerText}>{format(weekStart, 'MMMM yyyy')}</Text>
                <TouchableOpacity style={styles.navButton} onPress={onNextWeek} testID={'next-week'}>
                    <Ionicons name='caret-forward-outline' size={32} color='#8B4513' />
                </TouchableOpacity>
            </View>
            <View style={styles.weekHeaderContainer}>
                <View style={styles.weekHeaderRow}>
                    {/* Render the week number */}
                    <View style={styles.weekHeaderCell}>
                        <Text style={styles.dayNumberText}>Wk {weekNum}</Text>
                    </View>
                    {daysOfWeek.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <View style={styles.weekHeaderCell} key={`header-${day}`}>
                                {/* Render the weekdays words and number */}
                                <Text style={styles.dayText}>{format(day, 'EEE')}</Text>
                                <View style={styles.separatorLine} />
                                <Text style={[ styles.dayNumberText, isToday && styles.dayNumberSelected ]}>
                                    {format(day, 'd')}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
            {/* Render the week container */}
            <ScrollView style={styles.scrollContainer} ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                {hours.map((hourLabel) => (
                    // The time labels based of the hours array
                    <View style={styles.hourRow} key={hourLabel}>
                        <View style={styles.hourColumn}>
                            <Text style={styles.hourText}>{hourLabel}</Text>
                        </View>

                        {daysOfWeek.map((day) => {
                            // Get the tasks for the current week
                            const dayHourTasks = getDayHourTasks(day, hourLabel);
                            
                            return (
                                <View style={styles.dayHourCell} key={day.toString() + hourLabel}>
                                    {dayHourTasks.length === 0 ? (
                                        // Render empty cell for no tasks
                                        <View style={{ minHeight: 70 }} />
                                    ) : (
                                        // Render the tasks in their day and time
                                        dayHourTasks.map((task) => renderDayHourTask(task))
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the headerRow
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 10,
    },
    // Style for the navButton
    navButton: {
        backgroundColor: '#F5F5DC',
        padding: 4,
    },
    // Style for the headerText
    headerText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#8B4513',
    },
    // Style for the weekHeaderContainer
    weekHeaderContainer: {
        borderTopWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the weekHeaderRow
    weekHeaderRow: {
        flexDirection: 'row',
        borderWidth: 1,
    },
    // Style for the weekHeaderCell
    weekHeaderCell: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#8B4513',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5DC',
        paddingVertical: 4,
    },
    // Style for the dayText
    dayText: {
        fontSize: 18,
        color: '#8B4513',
        fontWeight: '800',
    },
    // Style for the dayNumberText
    dayNumberText: {
        fontSize: 18,
        color: '#8B4513',
        fontWeight: '800',
    },
    // Style for the dayNumberSelected
    dayNumberSelected: {
        backgroundColor: '#8B4513',
        color: '#F5F5DC',
        borderRadius: 999,
        overflow: 'hidden',
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    // Style for the separatorLine
    separatorLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#8B4513',
        marginVertical: 2,
    },
    // Style for the scrollContainer
    scrollContainer: {
        flex: 1,
        backgroundColor: '#F5F5DC',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the hourRow
    hourRow: {
        flexDirection: 'row',
        minHeight: 70,
        borderBottomWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the hourColumn
    hourColumn: {
        width: '12.5%',
        borderWidth: 1,
        borderColor: '#8B4513',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5DC',
    },
    // Style for the hourText
    hourText: {
        color: '#8B4513',
        fontSize: 18,
        fontWeight: '800',
    },
    // Style for the dayHourCell
    dayHourCell: {
        width: '12.5%',
        borderWidth: 1,
        borderColor: '#8B4513',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#F5F5DC',
    },
    // Style for the dayTask
    dayTask: {
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        marginVertical: 2,
        marginHorizontal: 2,
        backgroundColor: '#F5F5DC',
        paddingHorizontal: 4,
        paddingVertical: 2,
        position: 'relative',
        minWidth: '90%',
    },
    // Style for the dayTaskCompleted
    dayTaskCompleted: {
        backgroundColor: '#8B4513',
    },
    // Style for the dayTaskText
    dayTaskText: {
        fontSize: 16,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the dayTaskTextCompleted
    dayTaskTextCompleted: {
        color: '#F5F5DC',
    },
    // Style for the dayTaskStrikeThrough
    dayTaskStrikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#F5F5DC',
        width: '95%',
        top: '60%',
        left: 2,
    },
});

export default WeeklyView;
