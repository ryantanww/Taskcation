# Import necessary
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import numpy as np

grades = ['A', 'B', 'C', 'D', 'E', 'F']
priorityLevels = ['Low', 'Medium', 'High', 'Urgent']


model = Sequential([
    Dense(8, activation='relu', input_shape=(len(grades),)),
    Dense(len(priorityLevels), activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

x_train = np.array([
    [1, 0, 0, 0, 0, 0],  # A
    [0, 1, 0, 0, 0, 0],  # B
    [0, 0, 1, 0, 0, 0],  # C
    [0, 0, 0, 1, 0, 0],  # D
    [0, 0, 0, 0, 1, 0],  # E
    [0, 0, 0, 0, 0, 1]   # F
], dtype=float)

y_train = np.array([
    [1, 0, 0, 0], # A: Low
    [0, 1, 0, 0], # B: Medium
    [0, 0, 1, 0], # C: High
    [0, 0, 1, 0], # D: High
    [0, 0, 0, 1], # E: Urgent
    [0, 0, 0, 1]  # F: Urgent
], dtype=float)

# Train the model.
model.fit(x_train, y_train, epochs=200, shuffle=True)

# Save the model in HDF5 format.
model.save('./src/mlModels/baselineModel.h5')