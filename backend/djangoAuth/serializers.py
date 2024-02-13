from rest_framework import serializers
from api.models import *


class StudentsInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentsInfo
        fields = (
            'student_id', 'student_surname', 'student_name', 'student_patronymic', 'student_telephone', 'date_born',
            'gradebook', 'citizenship', 'addmission_year', 'graduation_year', 'auth_user')


class TeacherInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherInfo
        fields = (
            'teacher_id', 'teacher_surname', 'teacher_name', 'teacher_patronymic', 'teacher_telephone', 'auth_user')


class PortfolioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioFile
        fields = ('student_id', 'student_surname', 'student_name', 'student_patronymic', 'student_telephone')


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ('shedule_id', 'shedule_room_number', 'course', 'shedule_time')


class CourseDirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseDirectory
        fields = ('course_id', 'course_name', 'course_start_date', 'course_end_date', 'course_dur_in_hours',
                  'max_peoples', 'course_info', 'facult', 'course_image_link')


class CourseTasks(serializers.ModelSerializer):
    class Meta:
        model = CourseTasks
        fields = ('ct_id', 'ct_name', 'ct_deadline', 'ct_description', 'course', 'ct_text_description')


class CourseProgram(serializers.ModelSerializer):
    class Meta:
        model = CourseProgram
        fields = ('cp_id', 'course', 'course_program_stage', 'ct_id')
