"""add_image_data_and_chat_features

Revision ID: 8d76df1da5c2
Revises: 25a5009cca5e
Create Date: 2026-03-30 14:50:06.452297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d76df1da5c2'
down_revision: Union[str, None] = '25a5009cca5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add image_data and content_type columns to product_images
    op.add_column('product_images', sa.Column('image_data', sa.LargeBinary(), nullable=True))
    op.add_column('product_images', sa.Column('content_type', sa.String(50), nullable=True))

    # Make image_url nullable with default empty string
    op.alter_column('product_images', 'image_url',
                     existing_type=sa.String(500),
                     server_default='',
                     nullable=True)

    # Add is_read column to messages
    op.add_column('messages', sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'))

    # Set existing messages as read
    op.execute("UPDATE messages SET is_read = true WHERE is_read IS NULL")

    # Make is_read non-nullable
    op.alter_column('messages', 'is_read',
                     existing_type=sa.Boolean(),
                     nullable=False,
                     server_default='false')


def downgrade() -> None:
    op.drop_column('messages', 'is_read')
    op.drop_column('product_images', 'content_type')
    op.drop_column('product_images', 'image_data')
    op.alter_column('product_images', 'image_url',
                     existing_type=sa.String(500),
                     server_default=None,
                     nullable=False)
