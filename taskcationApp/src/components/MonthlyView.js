// Import dependencies and libraries used in Monthly View
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
    format,
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    startOfWeek, 
    endOfWeek, 
    isSameDay, 
    isSameMonth 
} from 'date-fns';

const MonthlyView = ({ selectedDate, setSelectedDate, tasks, onTaskPress, onPrevMonth, onNextMonth, toggleTaskCompletion }) => {
    // Store the start of the month 
    const monthStart = startOfMonth(selectedDate);
    // Store the end of the month 
    const monthEnd = endOfMonth(selectedDate);

    // Determine the start of the month to ensure that full weeks are shown
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    // Determine the end of the month to ensure that full weeks are shown
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    // Get all the days from the start to the end of the calendar
    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    // Function to filter tasks that have an end_date matching the provided date
    const getTasksForDay = (day) => {
        return tasks.filter((task) => {
            if (!task.end_date) return false;
            return isSameDay(task.end_date, day);
        });
    }

    // Function to render the task list items for the selected date
    const renderTask = ({ item: task }) => {
        return (
            // Allows users to navigate to TaskDetailScreen screen when clicked
            <TouchableOpacity onPress={() => onTaskPress(task.id)} testID={`list-${task.id}`}>
                {/* Task container for each task, changes when completed */}
                <View style={[ styles.tasksContainer, task.status && styles.tasksCompletedContainer]}>
                    {/* Strike through line only when task is completed */}
                    {task.status && <View style={styles.strikeThrough} testID={`strikeThrough-list-${task.id}`}/>}

                    {/* Task name */}
                    <Text style={[ styles.tasksText, task.status && styles.tasksCompletedText]} numberOfLines={1} ellipsizeMode='tail'>
                        {task.task_name}
                    </Text>
                    
                    {/* Clickable Checkbox for toggling task completion */}
                    <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)} testID={`checkbox-${task.id}`} >
                        <Ionicons name={task.status ? 'checkbox' : 'square-outline'} size={28} color={task.status ? '#F5F5DC' : '#8B4513'}/>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Function to render the task list items inside the calendar cell
    function renderCellTask({ item: task }) {
        return (
            // Allows users to navigate to TaskDetailScreen screen when clicked
            <TouchableOpacity style={[styles.dayTask, task.status && styles.dayTaskCompleted]} onPress={() => onTaskPress(task.id)} testID={`cell-${task.id}`}>
                {/* Task name */}
                <Text style={[styles.dayTaskText, task.status && styles.dayTaskTextCompleted]} numberOfLines={1} ellipsizeMode='tail'>
                    {task.task_name}
                </Text>

                {/* Strike through line only when task is completed */}
                {task.status && <View style={styles.dayTaskStrikeThrough} testID={`strikeThrough-${task.id}`} />}
            </TouchableOpacity>
        );
    }
    
    // Get the tasks for the current selected date
    const tasksForSelectedDate = getTasksForDay(selectedDate);

    return (
        <View style={styles.container}>
            {/* Render the month and year with buttons to move back to previous month or forward to next month */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.navButton} onPress={onPrevMonth} testID={'prev-month'}>
                    <Ionicons name='caret-back-outline' size={32} color='#8B4513' />
                    </TouchableOpacity>
                <Text style={styles.headerText}>{format(selectedDate, 'MMMM yyyy')}</Text>
                <TouchableOpacity style={styles.navButton} onPress={onNextMonth} testID={'next-month'}>
                    <Ionicons name='caret-forward-outline' size={32} color='#8B4513' />
                </TouchableOpacity>
            </View>

            {/* Render the calendar grid */}
            <View style={styles.calendarContainer}>
                {/* Render the weekdays words */}
                <View style={styles.weekdaysContainer}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ].map((dayName) => (
                        <Text key={dayName} style={styles.weekdayText}>
                            {dayName}
                        </Text>
                    ))}
                </View>
                {/* Render the calendar grid */}
                <View style={styles.grid}>
                    {days.map((day) => {
                        // Get the tasks for all the days in that month
                        const dayTasks = getTasksForDay(day);
                        // The selected date would have a different look
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <View style={styles.dayCell} key={day.toString()}>
                                {/* The day in the calendar */}
                                <TouchableOpacity onPress={() => setSelectedDate(day)}>
                                    <Text style={[ styles.dayNumber, isSelected && styles.dayNumberSelected, !isSameMonth(day, selectedDate) && styles.dayNumberOtherMonth ]}>
                                        {format(day, 'd')}
                                    </Text>
                                </TouchableOpacity>
                                {/* The tasks for that day in the calendar */}
                                <FlatList
                                    data={dayTasks}
                                    keyExtractor={(task) => task.id}
                                    renderItem={renderCellTask}
                                    style={styles.dayTaskList}
                                    scrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
            {/* The task list for that selected day in the calendar */}
            <View style={styles.tasksForDayContainer}>
                <Text style={styles.tasksForDayTitle}>Tasks for {format(selectedDate, 'dd/MM/yyyy')}</Text>
                <View style={styles.line} />
                <FlatList
                    data={tasksForSelectedDate}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTask}
                    style={styles.tasksList}
                    showsVerticalScrollIndicator={false}
                />
            </View>
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
    // Style for the calendarContainer
    calendarContainer: {
        backgroundColor: '#F5F5DC',
    },
    // Style for the weekdaysContainer
    weekdaysContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the weekdayText
    weekdayText: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '800',
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#8B4513',
    },
    // Style for the dayCell
    dayCell: {
        width: '14.28%', 
        borderWidth: 1,
        borderColor: '#8B4513',
        minHeight: 70,
        maxHeight: 70,
        backgroundColor: '#F5F5DC',
        paddingLeft: 2,
    },
    // Style for the dayNumber
    dayNumber: {
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '800',
        marginBottom: 2,
        alignSelf: 'flex-start',
        paddingVertical: 2,
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
    // Style for the dayTask
    dayTask: {
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        marginBottom: 0.5,
        backgroundColor: '#F5F5DC',        
    },
    // Style for the dayTaskCompleted
    dayTaskCompleted: {
        backgroundColor: '#8B4513',
    },
    // Style for the dayTaskText
    dayTaskText: {
        fontSize: 14,
        color: '#8B4513',
        fontWeight: '500',
        alignItems: 'center',
    },
    // Style for the dayTaskTextCompleted
    dayTaskTextCompleted: {
        fontSize: 14,
        color: '#F5F5DC',
        fontWeight: '500',
        alignItems: 'center',
    },
    // Style for the dayTaskStrikeThrough
    dayTaskStrikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#F5F5DC',
        width: '100%',
        top: '50%',
        zIndex: 0,
    },
    // Style for the dayNumberOtherMonth
    dayNumberOtherMonth: {
        color: '#d2691e',
        fontWeight: '500',
    },
    // Style for the tasksForDayContainer
    tasksForDayContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    // Style for the tasksForDayTitle
    tasksForDayTitle: {
        marginTop: 6,
        fontSize: 24,
        fontWeight: '800',
        color: '#8B4513',
        textAlign: 'left',
    },
    // Style for the line
    line: {
        height: 2,
        backgroundColor: '#8B4513',
        marginBottom: 6,
    },
    // Style for the tasksList
    tasksList: {
        flex: 1,
    },
    // Style for the tasksContainer
    tasksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC', 
        position: 'relative',       
    },
    // Style for the tasksCompletedContainer
    tasksCompletedContainer: {
        backgroundColor: '#8B4513',
    },
    // Style for the tasksText
    tasksText: {
        fontSize: 20,
        color: '#8B4513',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the tasksCompletedText
    tasksCompletedText: {
        fontSize: 20,
        color: '#F5F5DC',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the strikeThrough
    strikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#F5F5DC',
        width: '90%',
        left: 5,
        top: '90%',
        zIndex: 0,
    },
});

export default MonthlyView;