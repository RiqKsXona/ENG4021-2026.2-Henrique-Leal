from django.db import models



class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.URLField(max_length=500)

    def __str__(self):
        return self.title
