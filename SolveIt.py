# ==========================================
# SolveIt - A Simple Problem Tracker
# ------------------------------------------
# This Python program allows users to record
# real-life problems they encounter and how
# they solved (or plan to solve) them.
#
# Each problem entry is saved in a text file
# with a timestamp for easy reference later.
#
# ==========================================

from datetime import datetime

class Problem:
    def __init__(self, problem, solution):
        self.problem = problem
        self.solution = solution
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_problem():
    problem = input("Enter the problem you faced: ")
    solution = input("How did you solve (or plan to solve) it: ")
    return Problem(problem, solution)


def main():
    problem = get_problem()
    with open("my_problem.txt", "a") as file:
        file.write(f"Date and Time: {problem.timestamp}\n\n")
        file.write(f"Problem: {problem.problem}\n")
        file.write(f"Solution: {problem.solution}\n\n")
        file.write("-" * 40 + "\n")
    print("Problem saved successfully!")




if __name__ == "__main__":
    main()

