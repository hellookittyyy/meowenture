from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Avatar(models.Model):
    image = models.ImageField(upload_to='avatars/')
    price = models.IntegerField(default=0)
    owners = models.ManyToManyField(User, related_name='avatars', blank=True)
    
    def __str__(self):
        return f"Avatar {self.id} (Price: {self.price})"

class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    level = models.IntegerField()
    success = models.BooleanField()
    time_spent = models.IntegerField(help_text='Time spent in seconds')
    score = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username}'s attempt at level {self.level} - {'Success' if self.success else 'Failed'}" 