import React, { useState } from "react";
import {
    Text,
    View,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    StyleSheet,
    Image
} from "react-native";
import { CheckBox } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const AddTaskScreen = () => {

    const [taskName, setTaskName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [endTime, setEndTime] = useState('');
    const [taskNotes, setTaskNotes] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');


    const handleAdd = () => {
        // On Press "Add" - do something
        // e.g., call createTask, navigate back, etc.
        console.log('Task added:', {
            taskName,
            startDate,
            startTime,
            endDate,
            endTime,
            taskNotes,
            selectedGroup,
            selectedPriority,
        });
    };
}

export default AddTaskScreen;