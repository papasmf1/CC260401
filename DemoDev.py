#Developer라는 클래스를 정의. id, name, skill이라는 속성을 가짐
class Developer:
    def __init__(self, id, name, skill):
        self.id = id
        self.name = name
        self.skill = skill

    def display_info(self):
        print(f"ID: {self.id}, Name: {self.name}, Skill: {self.skill}") 

#인스턴스를 생성

