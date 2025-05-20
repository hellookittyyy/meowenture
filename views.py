from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Attempt, Avatar
from django.db.models import Count
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def progress_attempt_view(request):
    if request.method == 'GET':
        # Get all attempts for the current user
        attempts = Attempt.objects.filter(user=request.user)
        return Response({
            'attempts': [{
                'id': attempt.id,
                'level': attempt.level,
                'success': attempt.success,
                'time_spent': attempt.time_spent,
                'score': attempt.score,
                'timestamp': attempt.timestamp
            } for attempt in attempts]
        })

    elif request.method == 'POST':
        """
        Handle user attempt submissions.
        Expected data:
        {
            "level": int,
            "success": bool,
            "time_spent": int (seconds),
            "score": int
        }
        """
        try:
            # Get the data from request
            level = request.data.get('level')
            success = request.data.get('success')
            time_spent = request.data.get('time_spent')
            score = request.data.get('score')

            # Validate required fields
            if None in (level, success, time_spent, score):
                return Response(
                    {'error': 'Missing required fields'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create and save attempt record
            attempt = Attempt.objects.create(
                user=request.user,
                level=level,
                success=success,
                time_spent=time_spent,
                score=score
            )

            return Response({
                'message': 'Attempt recorded successfully',
                'attempt': {
                    'id': attempt.id,
                    'level': attempt.level,
                    'success': attempt.success,
                    'time_spent': attempt.time_spent,
                    'score': attempt.score,
                    'timestamp': attempt.timestamp
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
def leaderboard_view(request):
    """
    Get leaderboard data showing users and their attempt counts
    """
    try:
        # Get users and their attempt counts, ordered by attempts
        leaderboard_data = User.objects.annotate(
            attempts=Count('attempts')
        ).values('username', 'attempts').order_by('-attempts')[:10]  # Top 10 users

        return Response({
            'leaderboard': list(leaderboard_data)
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def avatar_list_view(request):
    """
    Get list of available avatars with their purchase status for the current user
    """
    try:
        # Get all avatars
        avatars = Avatar.objects.all()
        
        # Get user's bought avatars
        user_avatars = request.user.avatars.all() if hasattr(request.user, 'avatars') else []
        
        # Prepare avatar data with purchase status
        avatar_list = []
        for avatar in avatars:
            avatar_data = {
                'id': avatar.id,
                'image': avatar.image.url if avatar.image else None,
                'is_bought': avatar in user_avatars,
                'price': avatar.price
            }
            avatar_list.append(avatar_data)
        
        return Response({
            'avatars': avatar_list
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 