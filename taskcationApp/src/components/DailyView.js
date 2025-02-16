// Import dependencies and libraries used in Daily View
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, isSameDay, getHours } from 'date-fns';

const DailyView = ({ selectedDate, tasks, onTaskPress, onPrevDay, onNextDay }) => {
    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // Reference for scrolling to current hour
    const scrollViewRef = useRef(null);
    
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
    function getHourTasks(hourLabel) {
        const targetHour = parseHour(hourLabel);
        return tasks.filter(task => {
            if (!task.end_date) return false;
            if (!isSameDay(task.end_date, selectedDate)) return false;

            const taskHour = getHours(task.end_date);
            return taskHour === targetHour;
        });
    }

    // Function to render the task list items inside the corresponding time in the daily calendar
    const renderTask = ( task ) => (
        // Allows users to navigate to TaskDetailScreen screen when clicked
        <TouchableOpacity key={task.id} style={[styles.hourTask, task.status && styles.hourTaskCompleted]} onPress={() => onTaskPress(task.id)}>
            {/* Task name */}
            <Text style={[styles.hourTaskText, task.status && styles.hourTaskTextCompleted]} numberOfLines={1} ellipsizeMode='tail'>
                {task.task_name}
            </Text>

            {/* Strike through line only when task is completed */}
            {task.status && <View style={styles.taskStrikeThrough} testID={`strikeThrough-${task.id}`} />}
        </TouchableOpacity>
    );
    

    return (
        <View style={styles.container}>
            {/* Render the day, month and year with buttons to move back to previous day or forward to next day */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.navButton} onPress={onPrevDay} testID={'prev-day'}>
                    <Ionicons name='caret-back-outline' size={32} color='#8B4513' />
                </TouchableOpacity>
                <Text style={styles.headerText}>{format(selectedDate, 'dd MMMM yyyy')}</Text>
                <TouchableOpacity style={styles.navButton} onPress={onNextDay} testID={'next-day'}>
                    <Ionicons name='caret-forward-outline' size={32} color='#8B4513' />
                </TouchableOpacity>
            </View>
            {/* Render the day container */}
            <ScrollView style={styles.scrollContainer} ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                {hours.map((hourLabel) => {
                    // Get the tasks for the current day based on time
                    const hourTasks = getHourTasks(hourLabel);
                    return (
                        // The time labels based of the hours array
                        <View style={styles.hourRow} key={hourLabel}>
                            <View style={styles.hourColumn}>
                                <Text style={styles.hourText}>{hourLabel}</Text>
                            </View>

                            <View style={styles.hourCell}>
                                {hourTasks.length === 0 ? (
                                        // Render empty cell for no tasks
                                    <View style={{ minHeight: 70 }} />
                                ) : (
                                    // Render the tasks in their time
                                    hourTasks.map((task) => renderTask(task))
                                )}
                            </View>
                        </View>
                    );
                })}
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
    // Style for the scrollContainer
    scrollContainer: {
        flex: 1,
        backgroundColor: '#F5F5DC',
        borderWidth: 1,
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
        width: '20%',
        borderWidth: 1,
        borderColor: '#8B4513',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5DC',
    },
    // Style for the hourTexthourText
    hourText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#8B4513',
    },
    // Style for the hourCell
    hourCell: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#8B4513',
        justifyContent: 'flex-start',
    },
    // Style for the hourTask
    hourTask: {
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
    // Style for the hourTaskCompleted
    hourTaskCompleted: {
        backgroundColor: '#8B4513',
    },
    // Style for the hourTaskText
    hourTaskText: {
        fontSize: 16,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the hourTaskTextCompleted
    hourTaskTextCompleted: {
        color: '#F5F5DC',
    },
    // Style for the taskStrikeThrough
    taskStrikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#F5F5DC',
        width: '100%',
        top: '55%',
        left: 2,
    },
});

export default DailyView;