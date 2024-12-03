# Step 1: Accept a list input from the user
user_input = input("Enter a list of elements separated by spaces: ").split()

# Step 2: Ask the user for slicing range
start = int(input("Enter the starting index for slicing: "))
end = int(input("Enter the ending index for slicing: "))

# Step 3: Validate slicing range against the list length
if start < 0 or end < 0:
    print("Invalid slicing range. Indices must be non-negative.")
elif start >= len(user_input):
    print(f"Invalid slicing range. Starting index ({start}) is out of range.")
elif end > len(user_input):
    print(f"Invalid slicing range. Ending index ({end}) is out of range.")
elif start >= end:
    print("Invalid slicing range. The starting index must be less than the ending index.")
else:
    # Step 4: Slice the list
    sliced_list = user_input[start:end]

    # Step 5: Print each element of the sliced list on a new line
    print("Sliced List:")
    for element in sliced_list:
        print(element)
